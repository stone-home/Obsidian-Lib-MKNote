import { App, TFile, normalizePath } from "obsidian";
import { IVaultAdapter } from "../types";

/**
 * An Obsidian-specific implementation of the `IVaultAdapter`.
 * This adapter wraps Obsidian's `Vault` and `FileManager` APIs, allowing the
 * Zettelkasten logic to interact directly with the user's active vault.
 * * It handles Obsidian-specific requirements such as path normalization,
 * internal caching, and safely moving files into folders that may not yet exist.
 */
export class ObsidianVaultAdapter implements IVaultAdapter {
    /**
     * @param {App} app - The Obsidian App instance, usually accessed via `this.app` in a Plugin.
     */
    constructor(private app: App) {}

    /**
     * Reads a markdown file from the vault.
     * * @param {string} path - The vault-relative path.
     * @returns {Promise<string>} The raw text content of the file.
     * @throws {Error} If the path does not point to a valid file.
     */
    public async read(path: string): Promise<string> {
        const file = this.app.vault.getAbstractFileByPath(normalizePath(path));
        if (file instanceof TFile) {
            return await this.app.vault.read(file);
        }
        throw new Error(`File not found: ${path}`);
    }

    /**
     * Writes content to a file.
     * If the file exists, it modifies it; otherwise, it creates a new one.
     * * @param {string} path - Target path (appends .md if missing).
     * @param {string} content - The markdown string to save.
     * @returns {Promise<void>}
     */
    public async write(path: string, content: string): Promise<void> {
        const normalized = normalizePath(path.endsWith('.md') ? path : `${path}.md`);
        const file = this.app.vault.getAbstractFileByPath(normalized);

        if (file instanceof TFile) {
            await this.app.vault.modify(file, content);
        } else {
            // Ensure the parent directory exists before creating the file
            await this.ensureFolder(normalized);
            await this.app.vault.create(normalized, content);
        }
    }

    /**
     * Checks if a file exists at the given path.
     * * @param {string} path - The path to verify.
     * @returns {Promise<boolean>}
     */
    public async exists(path: string): Promise<boolean> {
        return this.app.vault.getAbstractFileByPath(normalizePath(path)) instanceof TFile;
    }

    /**
     * Renames a file. Reuses the `move` logic as these are
     * the same underlying operation in Obsidian.
     */
    public async rename(oldPath: string, newPath: string): Promise<void> {
        await this.move(oldPath, newPath);
    }

    /**
     * Moves a file to a new path using the Obsidian `FileManager`.
     * This is preferred over `vault.rename` as it properly handles internal link updates.
     * * @param {string} oldPath - Current path.
     * @param {string} newPath - Target path.
     * @throws {Error} If the source file is missing.
     */
    public async move(oldPath: string, newPath: string): Promise<void> {
        const normalizedOld = normalizePath(oldPath);
        const normalizedNew = normalizePath(newPath);

        const file = this.app.vault.getAbstractFileByPath(normalizedOld);
        if (file instanceof TFile) {
            await this.ensureFolder(normalizedNew);
            // Using fileManager.renameFile updates internal Obsidian links automatically
            await this.app.fileManager.renameFile(file, normalizedNew);
        } else {
            throw new Error(`Move failed: Source file not found at ${oldPath}`);
        }
    }

    /**
     * Deletes a file by moving it to the system trash.
     * * @param {string} path - The file to delete.
     */
    public async delete(path: string): Promise<void> {
        const file = this.app.vault.getAbstractFileByPath(normalizePath(path));
        if (file instanceof TFile) {
            // 'true' uses the system trash; 'false' uses the local .obsidian/trash folder
            await this.app.vault.trash(file, true);
        } else {
            throw new Error(`Delete failed: File not found at ${path}`);
        }
    }

    /**
     * Retrieves the frontmatter directly from Obsidian's metadata cache.
     * This is significantly faster than reading the file from disk.
     * * @param {string} path - The file path.
     * @returns {object} The parsed frontmatter object or an empty object.
     * * @example
     * const fm = adapter.getFrontmatter("Notes/Ideas.md");
     * console.log(fm.tags);
     */
    public getFrontmatter(path: string): object {
        const file = this.app.vault.getAbstractFileByPath(normalizePath(path));
        if (file instanceof TFile) {
            const cache = this.app.metadataCache.getFileCache(file);
            return cache?.frontmatter || {};
        }
        return {};
    }

    /**
     * Helper method to recursively create folders for a given file path.
     * * @private
     * @param {string} path - The full file path.
     */
    private async ensureFolder(path: string): Promise<void> {
        const folderPath = path.substring(0, path.lastIndexOf("/"));
        if (folderPath && !this.app.vault.getAbstractFileByPath(folderPath)) {
            await this.app.vault.createFolder(folderPath);
        }
    }
}