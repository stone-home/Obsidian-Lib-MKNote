import * as fs from 'fs/promises';
import { NodeFileAdapter } from '../../../src/adapters/localfs-adapter';

jest.mock('fs/promises');

describe('NodeFileAdapter', () => {
    const adapter = new NodeFileAdapter('/base');

    it('read should use absolute paths', async () => {
        (fs.readFile as jest.Mock).mockResolvedValue('data');
        await adapter.read('note.md');

        // Ensure path.resolve was used internally
        expect(fs.readFile).toHaveBeenCalledWith(expect.stringContaining('/base'), 'utf-8');
    });

    it('exists should return boolean based on fs.access', async () => {
        (fs.access as jest.Mock).mockResolvedValue(undefined); // Success
        expect(await adapter.exists('test.md')).toBe(true);

        (fs.access as jest.Mock).mockRejectedValue(new Error()); // Fail
        expect(await adapter.exists('missing.md')).toBe(false);
    });
});