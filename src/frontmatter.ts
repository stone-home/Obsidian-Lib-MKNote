import { INoteFrontmatter } from "./types";

/**
 * Manages the YAML frontmatter of a note with type safety.
 * It uses a Map internally to allow for easy addition, removal, and modification of properties before serializing back to a string.
 *
 * @template T - The specific interface for your properties (e.g., `IZettelProperties`). Defaults to `INoteFrontmatter`.
 *
 * @example
 * interface MyProps extends INoteFrontmatter {
 * title: string;
 * tags: string[];
 * publish: boolean;
 * }
 *
 * const initialData = { title: "Note 1", tags: ["obsidian"], publish: true };
 * const manager = new FrontmatterManager<MyProps>(initialData);
 */
export class FrontmatterManager<T extends INoteFrontmatter = INoteFrontmatter> {
    private properties: Map<string, any>;

    /**
     * Creates a new instance of FrontmatterManager.
     *
     * @param {T} [initial] - The initial frontmatter object (parsed JSON/object). Defaults to an empty object.
     */
    constructor(initial: T = {} as T) {
        // Convert the incoming object (JSON) into a Map for easier editing
        this.properties = new Map(Object.entries(initial));
    }

    /**
     * Retrieves a property value by key.
     *
     * @template K - A key from the interface T.
     * @param {K} key - The property key to retrieve.
     * @returns {T[K] | undefined} The value associated with the key, or undefined if not found.
     *
     * @example
     * const title = manager.get("title"); // Typed as string | undefined
     */
    public get<K extends keyof T>(key: K): T[K] | undefined {
        return this.properties.get(key as string) as T[K];
    }

    /**
     * Sets a property value.
     * TypeScript ensures the value matches the type defined in interface T for the specific key.
     *
     * @template K - A key from the interface T.
     * @param {K} key - The property key to set.
     * @param {T[K]} value - The value to assign.
     *
     * @example
     * manager.set("publish", false); // OK
     * // manager.set("publish", "yes"); // Error: Type 'string' is not assignable to type 'boolean'.
     */
    public set<K extends keyof T>(key: K, value: T[K]): void {
        this.properties.set(key as string, value);
    }

    /**
     * Removes a property entirely from the frontmatter.
     *
     * @template K - A key from the interface T.
     * @param {K} key - The property key to remove.
     *
     * @example
     * manager.remove("aliases");
     */
    public remove<K extends keyof T>(key: K): void {
        this.properties.delete(key as string);
    }

    /**
     * Checks if a specific key exists in the current properties.
     *
     * @param {string} key - The key to check.
     * @returns {boolean} True if the key exists, false otherwise.
     */
    public has(key: string): boolean {
        return this.properties.has(key);
    }

    /**
     * Adds a tag or list of tags to the 'tags' property.
     * If the 'tags' property does not exist, it initializes it.
     * Automatically handles deduplication.
     *
     * @param {string | string[]} tag - A single tag string or an array of tag strings.
     *
     * @example
     * manager.addTag("pkm");
     * manager.addTag(["obsidian", "plugin"]);
     */
    public addTag(tag: string | string[]): void {
        const propName = "tags";
        if (!this.properties.has(propName)) {
            this.properties.set(propName, []);
        }
        this.insertElement("tags", tag);
    }

    /**
     * Helper to merge values into an array property with deduplication (Set).
     * Only works if the existing value at key `k` is an array.
     *
     * @param {string} k - The key to update.
     * @param {string | string[]} v - The value(s) to insert.
     */
    protected insertElement(k: string, v: string | string[]): void {
        const currentValue = this.properties.get(k);
        if (Array.isArray(currentValue)) {
            const newValue = Array.isArray(v) ? v : [v];
            const merged = Array.from(new Set([...currentValue, ...newValue]));
            this.properties.set(k, merged as T[keyof T]);
        }
    }

    /**
     * Batch updates properties from a partial object.
     * - If a key does not exist, it creates it.
     * - If a key exists and is an array, it merges the new values (deduplicated).
     * - If a key exists and is a scalar (string/number), **it preserves the original value** and does not overwrite it.
     *
     * @param {T} properties - An object containing the properties to update.
     *
     * @example
     * manager.batchUpdate({
     * tags: ["new-tag"], // Will be merged into existing tags
     * status: "draft"    // Will be added if missing
     * });
     */
    public batchUpdate(properties: T): void {
        Object.entries(properties).forEach(([k, v]) => {
            if (!this.properties.has(k)) {
                this.properties.set(k, v);
            } else {
                if (Array.isArray(this.properties.get(k))) {
                    this.insertElement(k, v as string | string[]);
                }
            }
        });
    }

    /**
     * Handles custom formatting for wiki-links.
     * If the string looks like `[[link]]`, it wraps it in double quotes to ensure valid YAML parsing.
     *
     * @private
     * @param {string} item - The string to check.
     * @returns {string} The formatted string.
     */
    private linkStringProcess(item: string): string {
        // If it looks like a wiki link [[...]], wrap it in quotes
        if (item.length >= 4 && item.startsWith("[[") && item.endsWith("]]")) {
            return `"${item}"`;
        }
        return item;
    }

    /**
     * Formats a single value for YAML string output.
     * Applies link processing for strings.
     *
     * @private
     * @param {any} value - The value to format.
     * @returns {string} The string representation of the value.
     */
    private formatValue(value: any): string {
        if (typeof value === 'string') {
            return this.linkStringProcess(value);
        }
        return String(value);
    }

    /**
     * Serializes the current properties Map back into a valid YAML string formatted for Obsidian.
     * Includes the `---` delimiters.
     *
     * - Arrays are formatted as indented lists.
     * - Null/undefined values are converted to empty strings.
     * - Wiki links are quoted.
     *
     * @returns {string} The complete YAML frontmatter string.
     *
     * @example
     * console.log(manager.toString());
     * // Output:
     * // ---
     * // title: My Note
     * // tags:
     * //   - obsidian
     * // ---
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
                let _value = value;
                if (_value === null || _value === undefined) {
                    _value = "";
                }
                output += `${key}: ${this.formatValue(_value)}\n`;
            }
        }

        output += "---\n";
        return output;
    }
}