import { FrontmatterBase } from "../types";

/**
 * The base structure for all notes in the Zettelkasten system.
 * Every note, regardless of its specific type, must contain these core properties
 * to ensure consistency and discoverability within the vault.
 * * @extends FrontmatterBase
 */
export interface ZettelkastenNoteFrontmatter extends FrontmatterBase {
    /** The human-readable title of the note. */
    title: string;
    /** A unique identifier (typically a timestamp-based ID or slug). */
    id: string;
    /** The creation date string (e.g., YYYY-MM-DD). */
    create: string;
    /** The classification of the note (e.g., 'fleeting', 'permanent'). */
    type: string;
    /** A list of Obsidian tags for categorization. */
    tags: string[];
    /** Alternative names or titles for the note to improve link resolution. */
    aliases: string[];
    /** External links or internal references used as the foundation for this note. */
    sources: string[];
}

/**
 * Frontmatter for Fleeting notes.
 * Fleeting notes are temporary captures of thoughts or information that need
 * to be processed later into permanent knowledge.
 * * @extends ZettelkastenNoteFrontmatter
 */
export interface FleetingFrontmatter extends ZettelkastenNoteFrontmatter {
    /** Indicates if the note is newly created and requires review or processing. */
    new: boolean;
    /** The original source URL or reference link where the information was captured. */
    url: string;
    /** Allows for additional arbitrary YAML keys. */
    [key: string]: any;
}

/**
 * Frontmatter for Literature notes.
 * These are summaries or highlights from external books, articles, or videos.
 * * @extends ZettelkastenNoteFrontmatter
 */
export interface LiteratureFrontmatter extends ZettelkastenNoteFrontmatter {
    /** Indicates if the literature review is pending further synthesis. */
    new: boolean;
    /** Link to the original source material. */
    url: string;
    /** List of CSS classes to trigger specific Obsidian workspace styling or themes. */
    cssclasses: Array<string>;
    /** Allows for additional arbitrary YAML keys. */
    [key: string]: any;
}

/**
 * Frontmatter for Permanent notes.
 * Permanent notes represent high-level knowledge synthesis and long-term storage.
 * * @extends ZettelkastenNoteFrontmatter
 */
export interface PermanentFrontmatter extends ZettelkastenNoteFrontmatter {
    /** Indicates if the permanent note is in a draft or polished state. */
    new: boolean;
    /** Reference URL if this permanent note is derived from a specific external entity. */
    url: string;
    /** Custom CSS classes for visual differentiation in Obsidian. */
    cssclasses: Array<string>;
    /** Allows for additional arbitrary YAML keys. */
    [key: string]: any;
}

/**
 * Frontmatter for Atom notes.
 * Atomic notes focus on a single, indivisible concept or fact.
 * * @extends ZettelkastenNoteFrontmatter
 */
export interface AtomFrontmatter extends ZettelkastenNoteFrontmatter {
    /** Indicates if the atom is newly extracted and needs refinement. */
    new: boolean;
    /** Source link for the specific concept. */
    url: string;
    /** Allows for additional arbitrary YAML keys. */
    [key: string]: any;
}

/**
 * A registry mapping note type keys to their respective Frontmatter interfaces.
 * This is used for type-safe lookups in factories, managers, or when
 * checking user settings.
 */
export interface NoteTypeMap {
    fleeting: FleetingFrontmatter;
    literature: LiteratureFrontmatter;
    permanent: PermanentFrontmatter;
    atom: AtomFrontmatter;
}

/**
 * Defines a specific section within a note template.
 * Used to pre-populate a note with structured headers and boilerplate text.
 */
export interface NoteTemplateSection {
    /** The header title of the section (e.g., "References", "Summary"). */
    title: string;
    /** The Markdown heading level (e.g., 2 for `##`). */
    level: number;
    /** Initial lines of text to be placed inside this section. */
    content: string[];
}

/**
 * Configuration structure for note templates.
 * Allows users to define default metadata and body structures for each note type.
 * * @example
 * const config: NoteTemplateConfig = {
 * properties: { tags: ["inbox"], status: "todo" },
 * sections: [{ title: "Notes", level: 2, content: ["- "] }]
 * };
 */
export interface NoteTemplateConfig {
    /** Preset frontmatter properties (YAML fields). */
    properties?: Record<string, any>;
    /** Preset body sections to be generated in order. */
    sections?: NoteTemplateSection[];
}

