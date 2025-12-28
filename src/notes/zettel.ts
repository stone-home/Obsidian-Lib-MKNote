import {App} from "obsidian";
import {NoteModel} from "../model";
import {ObsidianVaultAdapter} from "../adapters";
import {NOTE_TYPE_DEFAULTS, NoteType} from "./config";
import {NoteTypeMap} from "./types";
import { generateDate, generateZettelID } from "../utils"

/**
 * Factory class for creating and loading specialized Obsidian NoteModels.
 * Handles automatic data merging, adapter injection, and content initialization.
 */
export class ObsidianNoteFactory {
    /**
     * Creates a new NoteModel with default frontmatter and initial content sections.
     * * @template K - A specific note type from NoteTypeMap.
     * @param app - The Obsidian App instance.
     * @param path - The vault-relative path where the note will be created.
     * @param type - The type of note (e.g., 'fleeting', 'literature').
     * @param title - The display title of the note.
     * @returns A Promise resolving to a type-safe NoteModel.
     */
    public static async createByType<K extends NoteType>(
        app: App,
        path: string,
        type: K,
        title: string
    ): Promise<NoteModel<NoteTypeMap[K]>> {
        const adapter = new ObsidianVaultAdapter(app);

        // Merge defaults with mandatory initialization fields
        const initialData: NoteTypeMap[K] = {
            ...NOTE_TYPE_DEFAULTS[type],
            title: title,
            id: generateZettelID(),
            create: generateDate()
        };

        // Initialize NoteModel with the bound adapter and complete properties
        return new NoteModel<NoteTypeMap[K]>(adapter, path, initialData);
    }

    /**
     * Loads an existing note and applies default properties to ensure data completeness.
     * Useful for legacy notes missing new frontmatter fields.
     * * @template K - A specific note type from NoteTypeMap.
     * @param app - The Obsidian App instance.
     * @param path - The path to the existing Markdown file.
     * @param type - The expected note type for default value merging.
     * @returns A Promise resolving to a NoteModel with patched properties.
     */
    public static async loadAndPatch<K extends NoteType>(
        app: App,
        path: string,
        type: K
    ): Promise<NoteModel<NoteTypeMap[K]>> {
        const adapter = new ObsidianVaultAdapter(app);

        // NoteModel.load internally handles the merging of defaults and file data
        return await NoteModel.load<NoteTypeMap[K]>(
            adapter,
            path,
            NOTE_TYPE_DEFAULTS[type]
        );
    }
}