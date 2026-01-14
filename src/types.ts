// src/lib/core/types.ts

/**
 * Base type for frontmatter data, representing a loose key-value object.
 * Used as the fundamental constraint for any frontmatter structure.
 */
export type FrontmatterBase = Record<string, any>;

/**
 * A flexible type definition for Note Frontmatter (YAML metadata).
 * This generic identity type acts as a "Pass-Through Contract".
 *
 * It allows you to enforce strict typing for specific schemas (like Zettelkasten properties)
 * while falling back to a loose key-value object for generic notes if no type is provided.
 *
 * @template T - The specific interface defining your frontmatter structure.
 * Must extend `FrontmatterBase` (object with string keys).
 * Defaults to `FrontmatterBase` (loose typing) if not specified.
 *
 * @example
 * // Case 1: Loose typing (default)
 * const props: INoteFrontmatter = {};
 * props.title = "Hello";       // OK
 * props.customField = 123;     // OK (but no autocomplete)
 *
 * @example
 * // Case 2: Strict typing
 * interface IMySchema extends FrontmatterBase {
 * id: string;
 * tags: string[];
 * }
 * const strictProps: INoteFrontmatter<IMySchema> = { id: "1", tags: [] };
 * // strictProps.random = 1; // Error: 'random' does not exist in type 'IMySchema'
 */
export type INoteFrontmatter<T extends FrontmatterBase = FrontmatterBase> = T;

/**
 * Represents a distinct section within a markdown note.
 * Used by the `ContentManager` to organize note content.
 */
export interface INoteSection {
    /** Unique key for the section, derived from the title (e.g., "reference-links"). */
    id: string;
    /** The original display title of the section (e.g. "Reference Links"). */
    title: string;
    /** The heading level (1-6), corresponding to Markdown headers (e.g., 2 = `##`). */
    level: number;
    /** The body content of the section as an array of strings (lines). */
    content: string[];
}

/**
 * Interface for abstracting file system operations.
 * This generic adapter pattern allows the core logic to be agnostic of the environment,
 * enabling you to easily swap between the Obsidian Vault API (for the plugin)
 * and the standard Node.js `fs` module (for unit testing or CLI tools).
 *
 * @example
 * // Mock implementation for testing
 * class MockAdapter implements IVaultAdapter {
 * async read(path: string) { return "mock content"; }
 * async write(path: string, content: string) { console.log("Written to", path); }
 * // ... implement other methods
 * }
 */
export interface IVaultAdapter {
    /**
     * Reads the content of a file at the given path.
     * @param path - The file path relative to the vault root.
     * @returns A promise resolving to the string content of the file.
     */
    read(path: string): Promise<string>;

    /**
     * Writes content to a file. If the file exists, it should be overwritten.
     * @param path - The file path relative to the vault root.
     * @param content - The string content to write.
     */
    write(path: string, content: string): Promise<void>;

    /**
     * Checks if a file exists at the given path.
     * @param path - The file path to check.
     */
    exists(path: string): Promise<boolean>;

    /**
     * Renames a file or folder.
     * @param oldPath - The current path.
     * @param newPath - The desired new path.
     */
    rename(oldPath: string, newPath: string): Promise<void>;

    /**
     * Moves a file to a new location (functionally often similar to rename, but explicit).
     * @param oldPath - The current path.
     * @param newPath - The destination path.
     */
    move(oldPath: string, newPath: string): Promise<void>;

    /**
     * Deletes a file at the given path.
     * @param path - The file path to delete.
     */
    delete(path: string): Promise<void>;

    /**
     * Optional method to retrieve parsed frontmatter without reading the whole file.
     * Useful if the underlying platform (like Obsidian) provides a metadata cache API.
     * @param path - The file path.
     * @returns The parsed frontmatter object if available.
     */
    getFrontmatter?(path: string): object;
}

