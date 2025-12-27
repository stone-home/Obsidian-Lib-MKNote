// src/lib/core/content.ts
import { INoteSection } from "./types";


export class ContentManager {
    private sections: Map<string, INoteSection>;
    private sectionOrder: string[];

    constructor() {
        this.sections = new Map();
        this.sectionOrder = [];
    }

    /**
     * Generates a unique ID for a section based on its title.
     */
    private generateId(title: string): string {
        return title.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '') || 'default';
    }

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

    public getSection(title: string): INoteSection | undefined {
        const id = this.generateId(title);
        return this.sections.get(id);
    }

    public appendToSection(title: string, text: string): void {
        const section = this.getSection(title);
        if (section) {
            section.content.push(text);
        } else {
            // Defaults to level 2 if creating a new section via append
            this.addSection(title, 2, [text]);
        }
    }

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