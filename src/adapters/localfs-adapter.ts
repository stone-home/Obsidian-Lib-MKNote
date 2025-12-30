import * as fs from 'fs/promises';
import * as path from 'path';
import { IVaultAdapter } from "../types";

export class NodeFileAdapter implements IVaultAdapter {
    constructor(private rootDir: string = "") {}

    private getFullPath(filePath: string): string {
        return path.resolve(this.rootDir, filePath);
    }

    public async read(filePath: string): Promise<string> {
        return await fs.readFile(this.getFullPath(filePath), "utf-8");
    }

    public async write(filePath: string, content: string): Promise<void> {
        const fullPath = this.getFullPath(filePath);
        const dir = path.dirname(fullPath);

        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(fullPath, content, "utf-8");
    }

    public async exists(filePath: string): Promise<boolean> {
        try {
            await fs.access(this.getFullPath(filePath));
            return true;
        } catch {
            return false;
        }
    }

    public async rename(oldPath: string, newPath: string): Promise<void> {
        await this.move(oldPath, newPath);
    }

    public async delete(filePath: string): Promise<void> {
        await fs.unlink(this.getFullPath(filePath)); //
    }

    public async move(oldPath: string, newPath: string): Promise<void> {
        const fullOldPath = this.getFullPath(oldPath);
        const fullNewPath = this.getFullPath(newPath);

        const newDir = path.dirname(fullNewPath);
        await fs.mkdir(newDir, { recursive: true });

        await fs.rename(fullOldPath, fullNewPath);
    }
}