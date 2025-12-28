import { NoteTypeMap } from "./types";

/** Valid identifiers for supported note types. */
export type NoteType = keyof NoteTypeMap;

/**
 * Common default values shared across all note types to ensure structural integrity.
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
 * Default frontmatter configurations for each note type.
 * Ensures that newly created or patched notes have all required fields.
 */
export const NOTE_TYPE_DEFAULTS: { [K in NoteType]: NoteTypeMap[K] } = {
    fleeting: {
        ...COMMON_DEFAULTS,
        type: "fleeting",
        new: true,
        url: ""
    },
    literature: {
        ...COMMON_DEFAULTS,
        type: "literature",
        new: true,
        url: "",
        cssclasses: []
    },
    permanent: {
        ...COMMON_DEFAULTS,
        type: "permanent",
        new: false,
        url: "",
        cssclasses: []
    },
    atom: {
        ...COMMON_DEFAULTS,
        type: "atom",
        new: true,
        url: ""
    }
};