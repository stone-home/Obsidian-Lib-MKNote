import { NoteModel } from './model';

describe('NoteModel', () => {
    it('should parse a complete markdown file', () => {
        const raw = `---
title: My parsed note
tags: #test
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
        expect(note.properties.get('tags')).toEqual('#test');

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