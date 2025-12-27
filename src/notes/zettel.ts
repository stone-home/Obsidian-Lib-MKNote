import { IZettelProperties } from "./types";
import { NoteModel } from "../model"
import { IVaultAdapter } from "../types"

export class ZettelNote {
    /**
     * Replaces the old BaseDefault constructor logic
     */
    public static async createNew(adapter: IVaultAdapter, path: string, title: string): Promise<NoteModel<IZettelProperties>> {
        const note = new NoteModel<IZettelProperties>(path);

        // Setting default properties (replacing ZettelkastenProperty constructor)
        note.properties.set("id", Date.now().toString());
        note.properties.set("create", new Date().toISOString());
        note.properties.set("title", title);
        note.properties.set("sources", []);

        // Setting default body structure
        note.content.addSection("Source", 4, ["Add your sources here..."]);

        return note;
    }
}