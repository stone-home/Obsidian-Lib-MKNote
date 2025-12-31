import { App } from "obsidian";
import { generateDate, generateZettelID } from "../utils";
import { ObsidianVaultAdapter } from "../adapters";
import { NOTE_TYPE_DEFAULTS, NoteType, isValidNoteType } from "./config";
import { NoteTypeMap, NoteTemplateConfig } from "./types";
import { ZettelNoteModel } from "./model";

/**
 * Factory class for creating and loading specialized Obsidian ZettelNoteModels.
 * * This class implements the Factory Pattern to simplify the instantiation of notes.
 * It handles the boilerplate of injecting the `ObsidianVaultAdapter`, generating
 * unique IDs, and applying template configurations so that the rest of the plugin
 * can create notes with a single method call.
 */
export class ObsidianNoteFactory {
    /**
     * Creates a new `ZettelNoteModel` with pre-populated default frontmatter
     * and optional content sections based on a template.
     * * @template K - A valid note type key (e.g., 'fleeting', 'literature').
     * @param {App} app - The global Obsidian App instance.
     * @param {string} path - The vault-relative path (including extension) where the note will exist.
     * @param {K} type - The classification for the new note.
     * @param {string} title - The human-readable title to be stored in the frontmatter.
     * @param {NoteTemplateConfig} [config] - Optional configuration to apply specific YAML fields or body sections.
     * * @returns {Promise<ZettelNoteModel<NoteTypeMap[K]>>} A promise resolving to an initialized note model.
     * * @example
     * const note = await ObsidianNoteFactory.createByType(
     * this.app,
     * "Inbox/New Thought.md",
     * "fleeting",
     * "New Thought"
     * );
     * await note.save();
     */
    public static async createByType<K extends NoteType>(
        app: App,
        path: string,
        type: K,
        title: string,
        config?: NoteTemplateConfig
    ): Promise<ZettelNoteModel<NoteTypeMap[K]>> {
        const adapter = new ObsidianVaultAdapter(app);

        // Merge static defaults from config with runtime-generated metadata
        const initialData: NoteTypeMap[K] = {
            ...NOTE_TYPE_DEFAULTS[type],
            title: title,
            id: generateZettelID(),
            create: generateDate()
        };

        // Initialize the model with the Obsidian-specific adapter
        const note = new ZettelNoteModel<NoteTypeMap[K]>(adapter, path, initialData);

        // Apply additional user-defined template structures if provided
        if (config) {
            note.applyConfigTemplate(config);
        }
        return note;
    }

    /**
     * Loads an existing Markdown file from the vault and transforms it into a `ZettelNoteModel`.
     * * This method is particularly useful for "upgrading" legacy notes. It parses the
     * existing file but ensures that any missing frontmatter fields required by the
     * specified `type` are filled with default values.
     * * @template K - A valid note type key.
     * @param {App} app - The global Obsidian App instance.
     * @param {string} path - The path to the existing Markdown file.
     * * @returns {Promise<ZettelNoteModel<NoteTypeMap[K]>>} A promise resolving to a model representing the existing file.
     * * @example
     * // Load an old note and ensure it has all 'literature' fields
     * const note = await ObsidianNoteFactory.loadAndPatch(this.app, "Archive/OldNote.md", "literature");
     * console.log(note.properties.get("type")); // "literature"
     */
    public static async loadAndPatch(
        app: App,
        path: string,
    ): Promise<ZettelNoteModel<NoteTypeMap[NoteType]>> {
        const adapter = new ObsidianVaultAdapter(app);
        const rawFM = adapter.getFrontmatter(path);
        const typeFromFM = rawFM?.type;

        const finalType: NoteType = isValidNoteType(typeFromFM) ? typeFromFM : "fleeting";
        const defaults = NOTE_TYPE_DEFAULTS[finalType];

        return await ZettelNoteModel.load(
            adapter,
            path,
            defaults
        );

    }
}