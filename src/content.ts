// src/lib/core/content.ts
import { INoteSection } from "./types";

/**
 * Manages the body content of a note by organizing it into sections.
 * It allows adding, appending, and retrieving sections by title, and serializing the content back to Markdown.
 *
 * @example
 * const content = new ContentManager();
 * content.addSection("Introduction", 1, ["Hello world."]);
 * content.appendToSection("Introduction", "This is a new line.");
 * console.log(content.toString());
 */
export class ContentManager {
    private sections: Map<string, INoteSection>;
    private sectionOrder: string[];

    /**
     * Initializes a new ContentManager instance.
     */
    constructor() {
        this.sections = new Map();
        this.sectionOrder = [];
    }

    /**
     * Generates a unique, URL-friendly ID (slug) based on the section title.
     * Converts to lowercase, replaces non-word characters with hyphens, and trims hyphens.
     *
     * @private
     * @param {string} title - The raw section title.
     * @returns {string} The normalized ID or 'default' if the resulting string is empty.
     */
    private generateId(title: string): string {
        return title.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '') || 'default';
    }

    /**
     * Adds a new section or appends content to an existing one if the ID matches.
     *
     * @param {string} title - The title of the section.
     * @param {number} [level=1] - The heading level (e.g., 1 for H1 `#`, 2 for H2 `##`). Defaults to 1.
     * @param {string[]} [content=[]] - Initial lines of text to add to the section.
     *
     * @example
     * // Create a new H2 section
     * manager.addSection("My Section", 2, ["Initial text"]);
     *
     * @example
     * // Add to existing section (merges content)
     * manager.addSection("My Section", 2, ["More text"]);
     */
    public addSection(title: string, level: number = 1, content: string[] = []): void {
        const id = this.generateId(title);

        if (this.sections.has(id)) {
            // Append to existing
            const existing = this.sections.get(id)!;
            existing.content.push(...content);
        } else {
            // Create new
            this.sections.set(id, { id, title, level, content });
            this.sectionOrder.push(id);
        }
    }

    /**
     * Retrieves a section object by its title.
     * The title is normalized to an ID before lookup.
     *
     * @param {string} title - The title to look up.
     * @returns {INoteSection | undefined} The section object if found, otherwise undefined.
     */
    public getSection(title: string): INoteSection | undefined {
        const id = this.generateId(title);
        return this.sections.get(id);
    }

    /**
     * Appends a single line of text to a specific section.
     * If the section does not exist, it creates a new one with the given title at header level 2.
     *
     * @param {string} title - The title of the target section.
     * @param {string} text - The text line to append.
     *
     * @example
     * manager.appendToSection("Resources", "- [Link](http://example.com)");
     */
    public appendToSection(title: string, text: string): void {
        const section = this.getSection(title);
        if (section) {
            section.content.push(text);
        } else {
            // Defaults to level 2 if creating a new section via append
            this.addSection(title, 2, [text]);
        }
    }

    /**
     * Serializes the sections into a single Markdown string.
     * - Iterates through sections in the order they were created.
     * - Skips the header for sections with the ID 'default'.
     * - Ensures spacing between sections.
     *
     * @returns {string} The complete Markdown body content.
     */
    public toString(): string {
        let output = "";
        for (const id of this.sectionOrder) {
            const section = this.sections.get(id)!;

            // Skip header for the "default" (preamble) section
            if (section.title && section.id !== 'default') {
                output += `${"#".repeat(section.level)} ${section.title}\n`;
            }
            if (section.content.length > 0) {
                output += section.content.join("\n") + "\n";
                if (section.content.at(-1) !== "") {
                    output += "\n";
                }
            } else {
                output += "\n";
            }
        }
        return output.trim();
    }
}