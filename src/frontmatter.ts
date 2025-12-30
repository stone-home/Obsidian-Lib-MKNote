import { INoteFrontmatter } from "./types";

/**
 * Manages the YAML frontmatter of a note.
 * * @template T - The specific interface for your properties (e.g., IZettelProperties).
 * Defaults to a generic object if not specified.
 */
export class FrontmatterManager<T extends INoteFrontmatter = INoteFrontmatter> {
    private properties: Map<string, unknown>;

    constructor(initial: T = {} as T) {
        // Convert the incoming object (JSON) into a Map for easier editing
        this.properties = new Map(Object.entries(initial));
    }

    /**
     * Get a property value.
     * TypeScript will know the correct return type based on T.
     * Let generic type K be a string, but K must be one of the keys found inside T.
     */
    public get<K extends keyof T>(key: K): T[K] | undefined {
        return this.properties.get(key as string) as T[K];
    }

    /**
     * Set a property value.
     * TypeScript ensures 'value' matches the type defined in T for this key.
     */
    public set<K extends keyof T>(key: K, value: T[K]): void {
        this.properties.set(key as string, value);
    }

    /**
     * Remove a property entirely.
     */
    public remove<K extends keyof T>(key: K): void {
        this.properties.delete(key as string);
    }

    /**
     * Check if a property exists.
     */
    public has(key: string): boolean {
        return this.properties.has(key);
    }

    /**
     * Specific helper for Tags (always handy to have).
     */
    public addTag(tag: string | string[]): void {
        const propName = "tags"
        if (!this.properties.has(propName)) {
            this.properties.set(propName, []);
        }
        this.insertElement("tags", tag)
    }

    protected insertElement(k: string, v: string| string[]): void {
        const currentValue = this.properties.get(k)
        if (Array.isArray(currentValue)) {
            const newValue = Array.isArray(v) ? v : [v];
            const merged = Array.from(new Set([...currentValue, ...newValue]));
            this.properties.set(k, merged as T[keyof T]);
        }
    }

    public batchUpdate(properties: T): void {
        Object.entries(properties).forEach(([k, v]) => {
            if (!this.properties.has(k)) {
                this.properties.set(k, v);
            } else {
                if (Array.isArray(this.properties.get(k))) {
                    this.insertElement(k, v as string| string[])
                }
            }
        });
    }

    /**
     * Handles your custom [[link]] formatting requirements.
     */
    private linkStringProcess(item: string): string {
        // If it looks like a wiki link [[...]], wrap it in quotes
        if (item.length >= 4 && item.startsWith("[[") && item.endsWith("]]")) {
            return `"${item}"`;
        }
        return item;
    }

    /**
     * Formats a single value for YAML output.
     */
    private formatValue(value: unknown): string {
        if (typeof value === 'string') {
            return this.linkStringProcess(value);
        }
        return String(value);
    }

    /**
     * Converts the entire Map back into a YAML string.
     */
    public toString(): string {
        if (this.properties.size === 0) return "";

        let output = "---\n";

        for (const [key, value] of this.properties) {
            // Case 1: Arrays (e.g., tags: [...])
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    output += `${key}: []\n`; // Empty array format
                } else {
                    output += `${key}:\n`;
                    // Filter nulls and format each item
                    const formattedItems = value
                        .filter(item => item !== undefined && item !== null)
                        .map(item => `  - ${this.formatValue(item)}`)
                        .join("\n");

                    output += formattedItems + "\n";
                }
            }
            // Case 2: Single Values (Strings, Numbers, Booleans)
            else {
                let _value = value
                if (_value === null || _value === undefined) {
                    _value = ""
                }
                output += `${key}: ${this.formatValue(_value)}\n`;
            }
        }

        output += "---\n";
        return output;
    }
}