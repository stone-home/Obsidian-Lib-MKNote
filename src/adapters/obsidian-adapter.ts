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
        return this.app.vault.getAbstractFileByPath(normalizePath(path)) instanceof TFile;
    }

    /**
     * Reuses the move logic as Obsidian treats rename and move as the same operation.
     */
    public async rename(oldPath: string, newPath: string): Promise<void> {
        await this.move(oldPath, newPath);
    }

    public async move(oldPath: string, newPath: string): Promise<void> {
        const normalizedOld = normalizePath(oldPath);
        const normalizedNew = normalizePath(newPath);

        const file = this.app.vault.getAbstractFileByPath(normalizedOld);
        if (file instanceof TFile) {
            await this.ensureFolder(normalizedNew);
            await this.app.fileManager.renameFile(file, normalizedNew);
        } else {
            throw new Error(`Move failed: Source file not found at ${oldPath}`);
        }
    }

    public async delete(path: string): Promise<void> {
        const file = this.app.vault.getAbstractFileByPath(normalizePath(path));
        if (file instanceof TFile) {
            await this.app.vault.trash(file, true); //
        } else {
            throw new Error(`Delete failed: File not found at ${path}`);
        }
    }

    public getFrontmatter(path: string): object {
        const file = this.app.vault.getAbstractFileByPath(normalizePath(path));
        if (file instanceof TFile) {
            const cache = this.app.metadataCache.getFileCache(file);
            return cache?.frontmatter || {};
        }
        return {};
    }

    private async ensureFolder(path: string): Promise<void> {
        const folderPath = path.substring(0, path.lastIndexOf("/"));
        if (folderPath && !this.app.vault.getAbstractFileByPath(folderPath)) {
            await this.app.vault.createFolder(folderPath);
        }
    }
}