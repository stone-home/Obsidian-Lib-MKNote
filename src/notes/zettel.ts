import {App} from "obsidian";
import { generateDate, generateZettelID } from "../utils"
import {ObsidianVaultAdapter} from "../adapters";
import {NOTE_TYPE_DEFAULTS, NoteType} from "./config";
import {NoteTypeMap} from "./types";
import {ZettelNoteModel} from "./model"

/**
 * Factory class for creating and loading specialized Obsidian ZettelNoteModels.
 * Handles automatic data merging, adapter injection, and content initialization.
 */
export class ObsidianNoteFactory {
    /**
     * Creates a new ZettelNoteModel with default frontmatter and initial content sections.
     * * @template K - A specific note type from NoteTypeMap.
     * @param app - The Obsidian App instance.
     * @param path - The vault-relative path where the note will be created.
     * @param type - The type of note (e.g., 'fleeting', 'literature').
     * @param title - The display title of the note.
     * @returns A Promise resolving to a type-safe ZettelNoteModel.
     */
    public static async createByType<K extends NoteType>(
        app: App,
        path: string,
        type: K,
        title: string
    ): Promise<ZettelNoteModel<NoteTypeMap[K]>> {
        const adapter = new ObsidianVaultAdapter(app);

        // Merge defaults with mandatory initialization fields
        const initialData: NoteTypeMap[K] = {
            ...NOTE_TYPE_DEFAULTS[type],
            title: title,
            id: generateZettelID(),
            create: generateDate()
        };

        // Initialize ZettelNoteModel with the bound adapter and complete properties
        return new ZettelNoteModel<NoteTypeMap[K]>(adapter, path, initialData);
    }

    /**
     * Loads an existing note and applies default properties to ensure data completeness.
     * Useful for legacy notes missing new frontmatter fields.
     * * @template K - A specific note type from NoteTypeMap.
     * @param app - The Obsidian App instance.
     * @param path - The path to the existing Markdown file.
     * @param type - The expected note type for default value merging.
     * @returns A Promise resolving to a ZettelNoteModel with patched properties.
     */
    public static async loadAndPatch<K extends NoteType>(
        app: App,
        path: string,
        type: K
    ): Promise<ZettelNoteModel<NoteTypeMap[K]>> {
        const adapter = new ObsidianVaultAdapter(app);

        // ZettelNoteModel.load internally handles the merging of defaults and file data
        return await ZettelNoteModel.load<NoteTypeMap[K]>(
            adapter,
            path,
            NOTE_TYPE_DEFAULTS[type]
        );
    }
}