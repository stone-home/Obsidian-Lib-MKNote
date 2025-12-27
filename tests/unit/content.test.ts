import { ContentManager } from '../../src/content';

describe('ContentManager', () => {
    let content: ContentManager;

    beforeEach(() => {
        content = new ContentManager();
    });

    it('should add a section and retrieve it', () => {
        content.addSection('Introduction', 1, ['Hello world']);

        const section = content.getSection('Introduction');
        expect(section).toBeDefined();
        expect(section?.content).toEqual(['Hello world']);
        expect(section?.level).toBe(1);
    });

    it('should append text to an existing section', () => {
        content.addSection('Notes', 2, ['Line 1']);
        content.appendToSection('Notes', 'Line 2');

        const section = content.getSection('Notes');
        expect(section?.content).toEqual(['Line 1', 'Line 2']);
    });

    it('should create a new section if appending to non-existent one', () => {
        content.appendToSection('New Section', 'I am here');

        const section = content.getSection('New Section');
        expect(section).toBeDefined();
        expect(section?.content).toEqual(['I am here']);
    });

    it('should normalize titles (case insensitive IDs)', () => {
        content.addSection('My Header', 1);

        // Should find it even if I search lowercase
        const section = content.getSection('my header');
        expect(section).toBeDefined();
        expect(section?.title).toBe('My Header');
    });

    it('should serialize to Markdown correctly', () => {
        content.addSection('Intro', 1, ['Hi']);
        content.addSection('Details', 2, ['Point A', 'Point B']);

        const output = content.toString();

        const expected = [
            '# Intro',
            'Hi',
            '',
            '## Details',
            'Point A',
            'Point B',
            ''
        ].join('\n');

        // We use trim() to ignore trailing newline differences
        expect(output.trim()).toBe(expected.trim());
    });
});