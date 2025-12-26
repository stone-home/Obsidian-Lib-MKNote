/**
 * A flexible type definition for Note Frontmatter (YAML metadata).
 * This generic identity type acts as a "Pass-Through Contract". It allows you to enforce
 * strict typing for specific schemas (like Zettelkasten properties) while falling back
 * to a loose key-value object for generic notes.
 * @template T - The specific interface defining your frontmatter structure.
 * Must extend `FrontmatterBase` (object with string keys).
 * Defaults to `FrontmatterBase` (loose typing) if not specified.
 *
 * Example 1:
 * // No <T> provided, so it defaults to "Any Object"
 * const props: INoteFrontmatter;
 *
 * props.title = "Hello"; // Allowed
 * props.randomJunk = 123; // Allowed (but dangerous, no autocomplete)
 *
 * Example 2:
 * interface MyZettel {
 *     id: string;
 *     tags: string[];
 * }
 *
 * // You fill in the <T> blank!
 * const props: INoteFrontmatter<MyZettel>;
 *
 * props.id = "123";   // ✅ Allowed
 * props.title = "Hi"; // ❌ ERROR! 'title' does not exist on MyZettel.
 */
export type FrontmatterBase = Record<string, unknown>;
export type INoteFrontmatter<T extends FrontmatterBase = FrontmatterBase> = T;


export interface INoteSection {
    id: string;      // Unique key for the section (normalized title)
    title: string;   // Original title (e.g. "Reference Links")
    level: number;   // Heading level (1-6)
    content: string[]; // Lines of text
}


export interface IVaultAdapter {
    read(path: string): Promise<string>;
    write(path: string, content: string): Promise<void>;
    exists(path: string): Promise<boolean>;
    rename(oldPath: string, newPath: string): Promise<void>;
}
