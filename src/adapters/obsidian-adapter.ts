// src/lib/core/adapters/obsidian-adapter.ts
import { App, TFile, normalizePath } from "obsidian";
import { IVaultAdapter } from "../types";

export class ObsidianVaultAdapter implements IVaultAdapter {
    constructor(private app: App) {}

    public async read(path: string): Promise<string> {
        const file = this.app.vault.getAbstractFileByPath(normalizePath(path));
        if (file instanceof TFile) {
            return await this.app.vault.read(file);
        }
        throw new Error(`File not found: ${path}`);
    }

    public async write(path: string, content: string): Promise<void> {
        const normalized = normalizePath(path.endsWith('.md') ? path : `${path}.md`);
        const file = this.app.vault.getAbstractFileByPath(normalized);

        if (file instanceof TFile) {
            await this.app.vault.modify(file, content);
        } else {
            await this.ensureFolder(normalized);
            await this.app.vault.create(normalized, content);
        }
    }

    public async exists(path: string): Promise<boolean> {
        const normalized = normalizePath(path);
        return this.app.vault.getAbstractFileByPath(normalized) instanceof TFile;
    }

    public async rename(oldPath: string, newPath: string): Promise<void> {
        const file = this.app.vault.getAbstractFileByPath(normalizePath(oldPath));
        if (file instanceof TFile) {
            await this.app.fileManager.renameFile(file, normalizePath(newPath));
        }
    }

    private async ensureFolder(path: string): Promise<void> {
        const folderPath = path.substring(0, path.lastIndexOf("/"));
        if (folderPath && !this.app.vault.getAbstractFileByPath(folderPath)) {
            await this.app.vault.createFolder(folderPath);
        }
    }
}