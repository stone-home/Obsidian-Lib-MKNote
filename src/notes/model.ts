import {NoteModel} from "../model"
import {FrontmatterBase, IVaultAdapter} from "../types";
import {ZettelkastenNoteFrontmatter, NoteTemplateConfig} from "./types"


export interface INoteLink {
    targetNote: ZettelNoteModel;
    linkToProps: boolean;
    sectionTitle?: string;
    form?: "list" | "checklist";
    link(): Promise<void>;
}


export class NoteLink implements INoteLink {
    public targetNote: ZettelNoteModel;
    public linkToProps: boolean;
    public sectionTitle: string;
    public form?: "list" | "checklist";
    public sourceContents: string[];

    /**
     * @param targetNote - The NoteModel instance where the link will be added.
     * @param linkToProps - Insert contents to frontmatter in given target rather than to specific section
     * @param sectionTitle - The title of the section in the target note to append to.
     * @param sourceContents - The strings (e.g., note titles) to be turned into [[links]].
     * @param form - Optional formatting (list or checklist).
     */
    constructor(
        targetNote: ZettelNoteModel,
        linkToProps: boolean = false,
        sectionTitle: string = "default",
        sourceContents: string[] = [],
        form?: "list" | "checklist"
    ) {
        this.targetNote = targetNote;
        this.linkToProps = linkToProps;
        this.sectionTitle = sectionTitle;
        this.sourceContents = sourceContents;
        this.form = form;
    }

    /**
     * Appends formatted links to the specified section of the target note and saves.
     */
    public async link(): Promise<void> {
        // In the new architecture, NoteModel is already loaded with content
        for (const content of this.sourceContents) {
            const linkText = this.formatLink(content);
            if (this.linkToProps) {
                this.targetNote.addSourceToProps(linkText)
            } else {
                this.targetNote.content.appendToSection(this.sectionTitle, linkText);
            }
        }

        // Persist the changes
        await this.targetNote.save();
    }

    private formatLink(content: string): string {
        let link = ""
        if (content.includes('[[') && content.includes(']]')) {
            link = content
        } else {
            link = `[[${content}]]`
        }

        if (this.linkToProps) {
            return link;
        } else {
            switch (this.form) {
                case "list":
                    return `- ${link}`;
                case "checklist":
                    return `- [ ] ${link}`;
                default:
                    return link;
            }
        }
    }
}


export class ZettelNoteModel<T extends FrontmatterBase = ZettelkastenNoteFrontmatter> extends NoteModel<T> {
    public relevantNotes: NoteLink[]


    constructor(adapter: IVaultAdapter, path: string, initialProps?: T) {
        super(adapter, path, initialProps)
        this.relevantNotes = []
    }

    public addRelevantNote(targetNote: ZettelNoteModel) {
        const note = new NoteLink(
            targetNote,
            true,
            "",
            [`[[${this.title}]]`],
        )
        this.relevantNotes.push(note)
    }

    public addSourceToProps(source: string|string[]) {
        const currentsource = (this.properties.get("sources") as string[]) || [];
        const newsource = Array.isArray(source) ? source : [source];
        // Merge and remove duplicates
        const merged = Array.from(new Set([...currentsource, ...newsource]));
        this.properties.set("sources", merged as T[keyof T]);
    }

    public async save(): Promise<void> {
        await this.adapter.write(this.path, this.serialize())
        for (const targetLink of this.relevantNotes) {
            await targetLink.link()
        }
    }

    /**
     * Factory method that replaces the static 'fromFile'.
     * It uses an adapter to remain environment-agnostic.
     * @param adapter - Give adapter of notes' manipulation
     * @param path - Markdown file path
     * @param defaults - Default values to fill missing fields.
     */
    public static override async load<T extends FrontmatterBase = ZettelkastenNoteFrontmatter>(
        adapter: IVaultAdapter,
        path: string,
        defaults: Partial<T> = {}
    ): Promise<ZettelNoteModel<T>> {
        const rawContent = await adapter.read(path);

        let externalProps: T | undefined;
        if (adapter.getFrontmatter) {
            externalProps = adapter.getFrontmatter(path) as T;
        }

        const instance = new ZettelNoteModel<T>(adapter, path);
        instance.setContent(rawContent, externalProps, defaults);
        return instance;
    }

    /**
     * Applies a graphical template configuration to this model.
     * This merges properties and appends sections without needing a Markdown file.
     * @param config - The template configuration from plugin settings.
     */
    public applyConfigTemplate(config: NoteTemplateConfig): void {
        // 1. Apply Properties
        if (config.properties) {
            for (const [key, value] of Object.entries(config.properties)) {
                // Only set if the property doesn't already exist to prevent overwriting core fields (ID, Date)
                if (!this.properties.has(key)) {
                    // Type assertion to bridge Record<string, unknown> with the generic T
                    this.properties.set(key as keyof T, value as T[keyof T]);
                }
            }
        }

        // 2. Apply Sections
        if (config.sections) {
            for (const section of config.sections) {
                // ContentManager handles section creation or content appending
                this.content.addSection(section.title, section.level, section.content);
            }
        }
    }
}