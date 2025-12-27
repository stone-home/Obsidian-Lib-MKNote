import { parse } from 'yaml';
import { FrontmatterManager } from "./frontmatter";
import { ContentManager } from "./content";
import { FrontmatterBase, IVaultAdapter } from "./types";

export class NoteModel<T extends FrontmatterBase = FrontmatterBase> {
    public path: string;
    public properties: FrontmatterManager<T>;
    public content: ContentManager;

    constructor(path: string, initialProps?: T) {
        this.path = path;
        this.properties = new FrontmatterManager<T>(initialProps);
        this.content = new ContentManager();
    }

    public get title(): string {
        const parts = this.path.split("/");
        const filename = parts[parts.length - 1];
        return filename.replace(/\.md$/, "");
    }

    /**
     * Factory method that replaces the static 'fromFile'.
     * It uses an adapter to remain environment-agnostic.
     */
    public static async load<T extends FrontmatterBase = FrontmatterBase>(
        adapter: IVaultAdapter,
        path: string
    ): Promise<NoteModel<T>> {
        const rawContent = await adapter.read(path);

        // Use optimized frontmatter from adapter if available (e.g., Obsidian MetadataCache)
        let externalProps: T | undefined;
        if (adapter.getFrontmatter) {
            externalProps = adapter.getFrontmatter(path) as T;
        }

        const instance = new NoteModel<T>(path);

        // If we have pre-parsed props, we skip parsing them from the string again
        instance.setContent(rawContent, externalProps);
        return instance;
    }

    /**
     * Parses raw Markdown content.
     * @param rawContent - The raw content of given markdown file
     * @param externalProps - A frontmatter object parsed by the function parsed by the adapter.
     */
    // src/model.ts
    public setContent(rawContent: string, externalProps?: T): void {
        const fmRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = rawContent.match(fmRegex);

        if (match) {
            const [, rawYaml, bodyContent] = match;

            // Use external props (from adapter cache) or parse them from raw string
            const props = externalProps || this.parseFrontmatter(rawYaml);

            // Sync into the properties manager to ensure consistency
            if (props) {
                Object.entries(props).forEach(([k, v]) => {
                    this.properties.set(k as keyof T, v as T[keyof T]);
                });
            }
            this.parseBody(bodyContent);
        } else {
            this.parseBody(rawContent);
        }
    }

    public async moveTo(adapter: IVaultAdapter, newPath: string): Promise<void> {
        await adapter.move(this.path, newPath);
        this.path = newPath;
    }

    public serialize(): string {
        return this.properties.toString() + this.content.toString();
    }

    /**
     * Refactored: Now returns an object instead of updating 'this.properties' directly.
     * This mimics the behavior of the yaml.parse() function.
     */
    private parseFrontmatter(yaml: string): T {
        try {
            const data = parse(yaml);
            return (data && typeof data === 'object') ? (data as T) : ({} as T);
        } catch (error) {
            console.error("Failed to parse YAML frontmatter:", error);
            return {} as T;
        }
    }

    private parseBody(body: string): void {
        const lines = body.split("\n");
        let currentSectionTitle = "default";
        let currentLevel = 1;
        let buffer: string[] = [];

        for (const line of lines) {
            const headerMatch = line.match(/^(#+)\s+(.+)$/);

            if (headerMatch) {
                if (buffer.length > 0 || currentSectionTitle !== "default") {
                    this.content.addSection(currentSectionTitle, currentLevel, buffer);
                }
                currentLevel = headerMatch[1].length;
                currentSectionTitle = headerMatch[2].trim();
                buffer = [];
            } else {
                buffer.push(line);
            }
        }

        if (buffer.length > 0 || currentSectionTitle !== "default") {
            this.content.addSection(currentSectionTitle, currentLevel, buffer);
        }
    }
}