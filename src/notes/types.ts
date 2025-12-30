import { FrontmatterBase } from "../types";


export interface ZettelkastenNoteFrontmatter extends FrontmatterBase {
    title: string,
    id: string,
    create: string,
    type: string,
    tags: string[],
    aliases: string[],
    sources: string[]
}



/**
 * Frontmatter for Fleeting notes (temporary thoughts).
 */
export interface FleetingFrontmatter extends ZettelkastenNoteFrontmatter {
    /** Indicates if the note is newly created and unreviewed. */
    new: boolean;
    /** Source URL or reference link. */
    url: string;
    [key: string]: unknown;
}

/**
 * Frontmatter for Literature notes (summaries of external content).
 */
export interface LiteratureFrontmatter extends ZettelkastenNoteFrontmatter {
    new: boolean;
    url: string;
    /** CSS classes for custom Obsidian styling. */
    cssclasses: Array<string>;
    [key: string]: unknown;
}

/**
 * Frontmatter for Permanent notes (atomic, long-term knowledge).
 */
export interface PermanentFrontmatter extends ZettelkastenNoteFrontmatter {
    new: boolean;
    url: string;
    cssclasses: Array<string>;
    [key: string]: unknown;
}

/**
 * Frontmatter for Atom notes (single concepts or facts).
 */
export interface AtomFrontmatter extends ZettelkastenNoteFrontmatter {
    new: boolean;
    url: string;
    [key: string]: unknown;
}

/**
 * A registry mapping note type keys to their respective Frontmatter interfaces.
 * Used for type inference in factories and managers.
 */
export interface NoteTypeMap {
    fleeting: FleetingFrontmatter;
    literature: LiteratureFrontmatter;
    permanent: PermanentFrontmatter;
    atom: AtomFrontmatter;
}


/**
 * Configuration structure for graphical templates in settings
 */
export interface NoteTemplateSection {
    title: string;
    level: number;
    content: string[];
}

export interface NoteTemplateConfig {
    /** Preset frontmatter properties (e.g., tags, specific fields) */
    properties?: Record<string, unknown>;
    /** Preset body sections and their initial content */
    sections?: NoteTemplateSection[];
}

