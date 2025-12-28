import * as fs from "fs"
import * as path from 'path';
import { NoteModel, NodeFileAdapter, FrontmatterBase } from '../../src';


interface IZettelProperties extends FrontmatterBase {
    id: string;
    title: string;
    type: string;
    aliases: string[];
    tags: string[];
    sources: string[];
}


// Define the interface based on the Zotero literature note structure
interface LiteratureNote extends FrontmatterBase {
    id: string;
    title: string;
    type: string;
    aliases: string[];
    year: string;
    tags: string[];
}


describe('NoteModel Smoke Test', () => {
    // Define the path to your real feature test file
    const featureFilePath = path.join(__dirname, '../features/test-simple-markdown.md');
    const adapter = new NodeFileAdapter();

    it('should successfully load, parse, and re-serialize a real markdown file', async () => {
        // 1. ACT: Load the note using the Adapter
        const note = await NoteModel.load<IZettelProperties>(adapter, featureFilePath);

        // 2. ASSERT: Basic Model Integrity
        expect(note).toBeDefined();
        expect(note.path).toBe(featureFilePath);

        // 3. ASSERT: Title Extraction
        // Based on your Model.ts logic: filename minus extension
        expect(note.title).toBe('test-simple-markdown');

        // 4. ASSERT: Frontmatter Parsing (from test-simple-markdown.md)
        expect(note.properties.get('type')).toBe('atom');
        expect(note.properties.get('id')).toBe('mjndwqgh1h89srotr3u');
        expect(note.properties.get('tags')).toContain('english');

        // 5. ASSERT: Content/Section Parsing
        const keyPoints = note.content.getSection('⚡️Key Points');
        expect(keyPoints).toBeDefined();
        expect(keyPoints?.level).toBe(1);
        expect(keyPoints?.content.length).toBeGreaterThan(0);

        // 6. ASSERT: Round-trip Integrity (Serialization)
        // A smoke test should ensure that reading and then writing produces consistent data
        const output = note.serialize();
        expect(output).toContain('title: A - Linguistics');
        expect(output).toContain('# ⚡️Key Points');
    });

    it('Verify whether generated data can be same as the original data', async () => {
        const note = await NoteModel.load<IZettelProperties>(adapter, featureFilePath);
        const generatedData = note.serialize()
        expect(generatedData).toBeDefined();

        const originalData = fs.readFileSync(featureFilePath, "utf-8");
        expect(generatedData).toBe(originalData);
    })
});





describe('NoteModel Complex Scenario Smoke Test', () => {
    // Assuming the file is saved at this path for the test
    const complexFilePath = path.join(__dirname, '../features/test-long-markdown.md');
    const adapter = new NodeFileAdapter();

    it('should correctly parse a complex literature note with nested formatting', async () => {
        // 1. ACT: Load the complex file
        const note = await NoteModel.load<LiteratureNote>(adapter, complexFilePath);

        // 2. ASSERT: Frontmatter Handling
        expect(note.properties.get('id')).toBe('fengOptimalGradientCheckpoint2021');

        // Verify multi-line array parsing (aliases)
        const aliases = note.properties.get('aliases');
        expect(Array.isArray(aliases)).toBe(true);
        expect(aliases).toHaveLength(2);
        expect(aliases?.[0]).toBe('fengOptimalGradientCheckpoint2021');

        // Verify tags array
        expect(note.properties.get('tags')).toContain('content/paper');

        // 3. ASSERT: Content & Section Parsing
        // The first lines are tags like #software/Zotero/...
        // According to our regex in model.ts, these belong to the 'default' section
        // because they lack a space after the '#'.
        const defaultSection = note.content.getSection('default');
        expect(defaultSection).toBeDefined();
        expect(defaultSection?.content[0]).toContain('#software/Zotero/concept');

        // Verify standard header parsing
        const abstractSection = note.content.getSection('Abstract');
        expect(abstractSection).toBeDefined();
        expect(abstractSection?.level).toBe(1);

        // Verify complex header with emoji and special characters
        const noteSection = note.content.getSection('🟨 Note (modified: 2025-10-13#20:44:10)');
        expect(noteSection).toBeDefined();
        expect(noteSection?.level).toBe(2);

        // 4. ASSERT: Callout and Admonition integrity
        // Sections should contain the raw callout syntax
        expect(abstractSection?.content.join('\n')).toContain('> [!info]+ Metadata');

        // 5. ASSERT: Round-trip consistency
        const serialized = note.serialize();
        expect(serialized).toContain('title: Optimal Gradient Checkpoint Search');
        expect(serialized).toContain('🔥🔥🔥everything above this line');
        expect(serialized).toContain('%% begin notes %%');
    });

    it('Verify whether generated data can be same as the original data', async () => {
        const note = await NoteModel.load<IZettelProperties>(adapter, complexFilePath);
        const generatedData = note.serialize()
        expect(generatedData).toBeDefined();

        const originalData = fs.readFileSync(complexFilePath, "utf-8");
        expect(generatedData).toBe(originalData);
    })
});