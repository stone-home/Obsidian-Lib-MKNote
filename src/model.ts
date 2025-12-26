// src/lib/core/model.ts
import { FrontmatterManager } from "./frontmatter";
import { ContentManager } from "./content";
import { FrontmatterBase } from "./types";

export class NoteModel<T extends FrontmatterBase = FrontmatterBase> {
    public path: string;

    // [FIX] Renamed from 'frontmatter' to 'properties' to match tests and your original naming
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
     * Parses raw Markdown content into Frontmatter and Sections.
     */
    public setContent(rawContent: string): void {
        const fmRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = rawContent.match(fmRegex);

        if (match) {
            this.parseFrontmatter(match[1]);
            this.parseBody(match[2]);
        } else {
            this.parseBody(rawContent);
        }
    }

    public serialize(): string {
        // [FIX] Updated to use this.properties
        return this.properties.toString() + this.content.toString();
    }

    private parseFrontmatter(yaml: string): void {
        const lines = yaml.split("\n");
        let currentKey = "";

        for (const line of lines) {
            if (!line.trim()) continue;

            const keyVal = line.match(/^(\w+):\s*(.*)$/);
            const listVal = line.match(/^\s*-\s+(.*)$/);

            if (keyVal) {
                currentKey = keyVal[1];
                let val: any = keyVal[2].trim();

                if (val === "true") val = true;
                if (val === "false") val = false;
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                if (val === "[]") val = [];

                // [FIX] Updated to use this.properties
                // We use 'as any' here because parsing raw strings into strict T is hard without a validation library
                this.properties.set(currentKey as any, val);
            } else if (listVal && currentKey) {
                // [FIX] Updated to use this.properties
                const existing = this.properties.get(currentKey as any);
                const item = listVal[1].replace(/^"|"$/g, '');

                if (Array.isArray(existing)) {
                    existing.push(item);
                } else {
                    this.properties.set(currentKey as any, [item] as any);
                }
            }
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