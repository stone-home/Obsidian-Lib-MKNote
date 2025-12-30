import { parse } from 'yaml';
import { FrontmatterManager } from "./frontmatter";
import { ContentManager } from "./content";
import { FrontmatterBase, IVaultAdapter } from "./types";

/**
 * Represents a complete Markdown note, acting as the primary model in the application.
 * It serves as a facade, coordinating the `FrontmatterManager` for metadata and the
 * `ContentManager` for body content, while using an `IVaultAdapter` for physical file operations.
 *
 * @template T - The specific frontmatter interface (defaults to a generic object).
 *
 * @example
 * // Load a note using the factory method
 * const note = await NoteModel.load(adapter, "folder/note.md");
 *
 * // Modify properties
 * note.properties.set("status", "done");
 *
 * // Save changes back to disk
 * await note.save();
 */
export class NoteModel<T extends FrontmatterBase = FrontmatterBase> {
    public path: string;
    public properties: FrontmatterManager<T>;
    public content: ContentManager;
    protected adapter: IVaultAdapter;

    /**
     * Creates an instance of NoteModel.
     * Note: Prefer using the static `NoteModel.load()` method for existing files.
     *
     * @param {IVaultAdapter} adapter - The file system adapter for IO operations.
     * @param {string} path - The file path relative to the vault root.
     * @param {T} [initialProps] - Optional initial properties to populate the frontmatter.
     */
    constructor(adapter: IVaultAdapter, path: string, initialProps?: T) {
        this.adapter = adapter;
        this.path = path;
        this.properties = new FrontmatterManager<T>(initialProps);
        this.content = new ContentManager();
    }

    /**
     * Retrieves the note title derived from the filename.
     * Removes the `.md` extension.
     *
     * @readonly
     * @returns {string} The title of the note.
     * @example
     * // path is "folder/My Note.md"
     * console.log(note.title); // "My Note"
     */
    public get title(): string {
        const parts = this.path.split("/");
        const filename = parts[parts.length - 1];
        return filename.replace(/\.md$/, "");
    }

    /**
     * Moves the file to a new location.
     * Updates the internal path reference upon success.
     *
     * @param {string} newPath - The destination path.
     * @returns {Promise<void>}
     */
    public async moveTo(newPath: string): Promise<void> {
        await this.adapter.move(this.path, newPath);
        this.path = newPath;
    }

    /**
     * Renames the file (similar to move, but semantically distinct in some adapters).
     *
     * @param {string} newPath - The new full path including filename.
     * @returns {Promise<void>}
     */
    public async rename(newPath: string): Promise<void> {
        await this.adapter.rename(this.path, newPath);
        this.path = newPath;
    }

    /**
     * Checks if the file currently exists in the vault.
     *
     * @returns {Promise<boolean>} True if the file exists.
     */
    public async exist(): Promise<boolean> {
        return await this.adapter.exists(this.path);
    }

    /**
     * Deletes the file permanently.
     *
     * @returns {Promise<void>}
     */
    public async delete(): Promise<void> {
        await this.adapter.delete(this.path);
    }

    /**
     * Serializes the current state (properties + content) and writes it to the file system.
     *
     * @returns {Promise<void>}
     */
    public async save(): Promise<void> {
        await this.adapter.write(this.path, this.serialize());
    }

    /**
     * Factory method to load a note from the file system.
     * It handles reading the file and parsing the content.
     * If the adapter supports cached metadata (`getFrontmatter`), it utilizes that optimization.
     *
     * @static
     * @template T
     * @param {IVaultAdapter} adapter - The file system adapter.
     * @param {string} path - The path to the markdown file.
     * @param {Partial<T>} [defaults={}] - Default property values to apply if missing in the file.
     * @returns {Promise<NoteModel<T>>} A fully initialized NoteModel instance.
     */
    public static async load<T extends FrontmatterBase = FrontmatterBase>(
        adapter: IVaultAdapter,
        path: string,
        defaults: Partial<T> = {}
    ): Promise<NoteModel<T>> {
        const rawContent = await adapter.read(path);

        // Use optimized frontmatter from adapter if available (e.g., Obsidian MetadataCache)
        let externalProps: T | undefined;
        if (adapter.getFrontmatter) {
            externalProps = adapter.getFrontmatter(path) as T;
        }

        const instance = new NoteModel<T>(adapter, path);

        // If we have pre-parsed props, we skip parsing them from the string again
        instance.setContent(rawContent, externalProps, defaults);
        return instance;
    }

    /**
     * Parses the raw Markdown content into Frontmatter and Body sections.
     * Uses regex to split the file at the YAML delimiter (`---`).
     *
     * @param {string} rawContent - The complete file content.
     * @param {T} [externalProps] - Pre-parsed frontmatter (optimization).
     * @param {Partial<T>} [defaults={}] - Default values to merge.
     */
    public setContent(
        rawContent: string,
        externalProps?: T,
        defaults: Partial<T> = {}
    ): void {
        // Regex to separate YAML frontmatter from body content
        const fmRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = rawContent.match(fmRegex);

        if (match) {
            const [, rawYaml, bodyContent] = match;

            // Use external props (from adapter cache) or parse them from raw string
            const props = externalProps || this.parseFrontmatter(rawYaml);
            const finalProps = { ...defaults, ...props } as T;

            // Sync into the properties manager to ensure consistency
            if (props) {
                this.properties.batchUpdate(finalProps);
            }
            this.parseBody(bodyContent);
        } else {
            // No frontmatter found, treat entire string as body
            this.parseBody(rawContent);
        }
    }

    /**
     * Combines the Frontmatter and Content sections into a single string.
     *
     * @returns {string} The fully reconstructed Markdown string.
     */
    public serialize(): string {
        return this.properties.toString() + this.content.toString();
    }

    /**
     * Safely parses a YAML string into an object.
     * Refactored to return the object rather than modifying state directly.
     *
     * @protected
     * @param {string} yaml - The YAML string block.
     * @returns {T} The parsed object or an empty object on failure.
     */
    protected parseFrontmatter(yaml: string): T {
        try {
            const data = parse(yaml);
            return (data && typeof data === 'object') ? (data as T) : ({} as T);
        } catch (error) {
            console.error("Failed to parse YAML frontmatter:", error);
            return {} as T;
        }
    }

    /**
     * Parses the markdown body into sections based on headers.
     * Text appearing before the first header is assigned to a section named "default".
     *
     * @protected
     * @param {string} body - The markdown body content.
     */
    protected parseBody(body: string): void {
        const lines = body.split("\n");
        let currentSectionTitle = "default";
        let currentLevel = 1;
        let buffer: string[] = [];

        for (const line of lines) {
            const headerMatch = line.match(/^(#+)\s+(.+)$/);

            if (headerMatch) {
                // Save previous section buffer
                if (buffer.length > 0 || currentSectionTitle !== "default") {
                    this.content.addSection(currentSectionTitle, currentLevel, buffer);
                }
                // Start new section
                currentLevel = headerMatch[1].length;
                currentSectionTitle = headerMatch[2].trim();
                buffer = [];
            } else {
                buffer.push(line);
            }
        }

        // Flush remaining buffer
        if (buffer.length > 0 || currentSectionTitle !== "default") {
            this.content.addSection(currentSectionTitle, currentLevel, buffer);
        }
    }
}