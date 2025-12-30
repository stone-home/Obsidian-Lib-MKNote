import * as fs from 'fs/promises';
import * as path from 'path';
import { IVaultAdapter } from "../types";

/**
 * A Node.js implementation of the `IVaultAdapter` interface.
 * This adapter uses the standard `fs/promises` module to perform file operations
 * on the local file system. It is ideal for unit testing, CI/CD pipelines,
 * or standalone scripts that process your Obsidian vault.
 * * @example
 * // Initialize for a test environment
 * const adapter = new NodeFileAdapter("./test-vault");
 * const content = await adapter.read("index.md");
 */
export class NodeFileAdapter implements IVaultAdapter {
    /**
     * @param {string} [rootDir=""] - The base directory for all file operations.
     * Defaults to the current working directory.
     */
    constructor(private rootDir: string = "") {}

    /**
     * Resolves a relative vault path to an absolute system path.
     * * @private
     * @param {string} filePath - The path relative to the rootDir.
     * @returns {string} The resolved absolute path.
     */
    private getFullPath(filePath: string): string {
        return path.resolve(this.rootDir, filePath);
    }

    /**
     * Reads the content of a file as a UTF-8 string.
     * * @param {string} filePath - Path to the file.
     * @returns {Promise<string>}
     * @throws Will throw an error if the file does not exist.
     */
    public async read(filePath: string): Promise<string> {
        return await fs.readFile(this.getFullPath(filePath), "utf-8");
    }

    /**
     * Writes content to a file.
     * Automatically creates parent directories if they do not exist.
     * * @param {string} filePath - Target file path.
     * @param {string} content - String content to write.
     * @returns {Promise<void>}
     */
    public async write(filePath: string, content: string): Promise<void> {
        const fullPath = this.getFullPath(filePath);
        const dir = path.dirname(fullPath);

        // Ensure the directory exists before writing
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(fullPath, content, "utf-8");
    }

    /**
     * Checks if a file or directory exists at the specified path.
     * * @param {string} filePath - Path to check.
     * @returns {Promise<boolean>} True if accessible, false otherwise.
     */
    public async exists(filePath: string): Promise<boolean> {
        try {
            await fs.access(this.getFullPath(filePath));
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Renames a file. Internally calls `move`.
     * * @param {string} oldPath - Current path.
     * @param {string} newPath - New path.
     * @returns {Promise<void>}
     */
    public async rename(oldPath: string, newPath: string): Promise<void> {
        await this.move(oldPath, newPath);
    }

    /**
     * Deletes a file from the file system.
     * * @param {string} filePath - Path to the file to be removed.
     * @returns {Promise<void>}
     */
    public async delete(filePath: string): Promise<void> {
        await fs.unlink(this.getFullPath(filePath));
    }

    /**
     * Moves a file to a new location.
     * Automatically creates the destination directory structure if needed.
     * * @param {string} oldPath - Source path.
     * @param {string} newPath - Destination path.
     * @returns {Promise<void>}
     */
    public async move(oldPath: string, newPath: string): Promise<void> {
        const fullOldPath = this.getFullPath(oldPath);
        const fullNewPath = this.getFullPath(newPath);

        const newDir = path.dirname(fullNewPath);
        await fs.mkdir(newDir, { recursive: true });

        await fs.rename(fullOldPath, fullNewPath);
    }
}