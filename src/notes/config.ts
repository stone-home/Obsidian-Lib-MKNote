import { NoteTypeMap } from "./types";

/** * Valid identifiers for supported note types.
 * Derived directly from the keys of {@link NoteTypeMap}.
 */
export type NoteType = keyof NoteTypeMap;


/**
 * Type Guard to safely check if a string is a valid NoteType at runtime.
 * This prevents TS7053 when indexing NOTE_TYPE_DEFAULTS with dynamic strings.
 */
export function isValidNoteType(type: string): type is NoteType {
    return type in NOTE_TYPE_DEFAULTS;
}

/**
 * Common default values shared across all note types.
 * These properties form the "Base" of the Zettelkasten frontmatter,
 * ensuring structural integrity even if a specific type is not fully defined.
 * * @private
 */
const COMMON_DEFAULTS = {
    title: "",
    id: "",
    create: "",
    tags: [],
    aliases: [],
    sources: []
};

/**
 * Default frontmatter configurations for each supported note type.
 * * This object uses a TypeScript Mapped Type `[K in NoteType]` to enforce
 * that every valid note type has a corresponding default configuration.
 * It is primarily used by the Note Factory to initialize new files with
 * the correct YAML schema.
 * * @example
 * // Get default properties for a literature note
 * const defaultLitProps = NOTE_TYPE_DEFAULTS["literature"];
 * console.log(defaultLitProps.cssclasses); // []
 * * @example
 * // Use when patching a note that has missing fields
 * const mergedProps = { ...NOTE_TYPE_DEFAULTS["fleeting"], ...existingProps };
 */
export const NOTE_TYPE_DEFAULTS: { [K in NoteType]: NoteTypeMap[K] } = {
    /** * Defaults for Fleeting Notes:
     * High-velocity capture, marked as 'new' by default for later processing.
     */
    fleeting: {
        ...COMMON_DEFAULTS,
        type: "fleeting",
        url: ""
    },
    /** * Defaults for Literature Notes:
     * Includes bibliographic fields and Obsidian CSS class support.
     */
    literature: {
        ...COMMON_DEFAULTS,
        type: "literature",
        url: "",
        cssclasses: []
    },
    /** * Defaults for Permanent Notes:
     * Long-term knowledge storage. Note that 'new' is false by default
     * as these are typically the end-result of a synthesis process.
     */
    permanent: {
        ...COMMON_DEFAULTS,
        type: "permanent",
        url: "",
        cssclasses: []
    },
    /** * Defaults for Atom Notes:
     * Single-concept notes used for building the knowledge graph.
     */
    atom: {
        ...COMMON_DEFAULTS,
        type: "atom",
        url: ""
    }
};