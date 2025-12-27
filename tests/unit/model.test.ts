import { NoteModel } from '../../src/model';
import { IVaultAdapter } from '../../src/types';

describe('NoteModel', () => {
    it('should parse a complete markdown file', () => {
        const raw = `---
title: My parsed note
tags: test
---
# Section 1
Content 1

## Section 2
Content 2
`;
        const note = new NoteModel('test.md');
        note.setContent(raw);

        // Check Frontmatter
        expect(note.properties.get('title')).toBe('My parsed note');
        expect(note.properties.get('tags')).toEqual('test');

        // Check Content
        const sec1 = note.content.getSection('Section 1');
        const sec2 = note.content.getSection('Section 2');

        expect(sec1).toBeDefined();
        expect(sec1?.content[0]).toBe('Content 1');
        expect(sec2?.level).toBe(2);
    });

    it('should parse content without frontmatter', () => {
        const raw = `# Just Header
Some text`;

        const note = new NoteModel('simple.md');
        note.setContent(raw);

        expect(note.properties.toString()).toBe(''); // Empty FM
        expect(note.content.getSection('Just Header')).toBeDefined();
    });

    it('should serialize back to string exactly', () => {
        const note = new NoteModel('demo.md');

        note.properties.set('id', 123);
        note.content.addSection('Main', 1, ['Text']);

        const output = note.serialize();

        expect(output).toContain('id: 123');
        expect(output).toContain('# Main');
        expect(output).toContain('Text');
    });

});


// Simple Mock Adapter for testing
const mockAdapter: IVaultAdapter = {
    read: jest.fn().mockResolvedValue('---\ntitle: Test\n---\n# Header\nContent'),
    write: jest.fn().mockResolvedValue(undefined),
    exists: jest.fn().mockResolvedValue(true),
    move: jest.fn().mockResolvedValue(undefined),
    rename: jest.fn().mockResolvedValue(undefined),
    getFrontmatter: jest.fn().mockReturnValue({ title: 'Cached Title' })
};

describe('NoteModel Unit Tests', () => {
    it('should load a note using an adapter and prioritize cached properties', async () => {
        // Testing the factory 'load' method with the adapter
        const note = await NoteModel.load(mockAdapter, 'folder/test.md');

        expect(note.path).toBe('folder/test.md');
        expect(note.title).toBe('test'); //

        // Should use 'Cached Title' from adapter.getFrontmatter instead of parsing string
        expect(note.properties.get('title')).toBe('Cached Title');
        expect(note.content.getSection('Header')).toBeDefined();
    });

    it('should parse raw content manually when no cached properties are provided', () => {
        const raw = '---\nid: 123\n---\n# Body\nText';
        const note = new NoteModel('test.md');

        // Manual parsing without skipFrontmatter
        note.setContent(raw);

        expect(note.properties.get('id')).toBe(123);
        expect(note.content.getSection('Body')?.content[0]).toBe('Text');
    });

    it('should update path internally after a moveTo call', async () => {
        const note = new NoteModel('old/path.md');
        await note.moveTo(mockAdapter, 'new/path.md');

        expect(mockAdapter.move).toHaveBeenCalledWith('old/path.md', 'new/path.md');
        expect(note.path).toBe('new/path.md'); //
    });

    it('should serialize properties and content into a valid Markdown string', () => {
        const note = new NoteModel('demo.md');
        note.properties.set('tags', ['unit-test']);
        note.content.addSection('Target', 1, ['Success']);

        const output = note.serialize(); //
        expect(output).toContain('---\ntags:\n  - unit-test\n---');
        expect(output).toContain('# Target\nSuccess');
    });
});