import { FrontmatterManager } from './frontmatter';
import { FrontmatterBase } from './types';

// Define a "Strict" interface for testing Scenario B
interface TestZettel extends FrontmatterBase {
    id: string;
    tags: string[];
    isDraft: boolean;
}

describe('FrontmatterManager', () => {

    // ==========================================
    // TEST GROUP 1: Basic Generic Usage
    // ==========================================
    describe('Generic Mode (Loose Typing)', () => {
        it('should initialize with empty properties', () => {
            const fm = new FrontmatterManager();
            expect(fm.toString()).toBe('');
        });

        it('should set and get values correctly', () => {
            const fm = new FrontmatterManager();
            fm.set('title', 'My Note');
            fm.set('count', 100);

            expect(fm.get('title')).toBe('My Note');
            expect(fm.get('count')).toBe(100);
        });

        it('should remove properties', () => {
            const fm = new FrontmatterManager({ temp: 'delete me' });
            fm.remove('temp');
            expect(fm.get('temp')).toBeUndefined();
        });
    });

    // ==========================================
    // TEST GROUP 2: Strict Typing (The <T> part)
    // ==========================================
    describe('Strict Mode (Typed Usage)', () => {
        it('should respect the interface types', () => {
            // TypeScript will check this at compile time
            // Jest checks it at runtime
            const fm = new FrontmatterManager<TestZettel>({
                id: '123',
                tags: ['a'],
                isDraft: true
            });

            const id = fm.get('id'); // Type is string
            const isDraft = fm.get('isDraft'); // Type is boolean

            expect(id).toBe('123');
            expect(isDraft).toBe(true);
        });
    });

    // ==========================================
    // TEST GROUP 3: Special Logic (Tags & Arrays)
    // ==========================================
    describe('Tag Management', () => {
        it('should add a single tag', () => {
            const fm = new FrontmatterManager();
            fm.addTag('research');
            expect(fm.get('tags')).toEqual(['research']);
        });

        it('should merge new tags without duplicates', () => {
            const fm = new FrontmatterManager({ tags: ['existing'] });

            fm.addTag(['new', 'existing']); // 'existing' is duplicate

            expect(fm.get('tags')).toEqual(['existing', 'new']);
        });
    });

    // ==========================================
    // TEST GROUP 4: Formatting (The [[Link]] Logic)
    // ==========================================
    describe('YAML Formatting', () => {
        it('should generate valid YAML string', () => {
            const fm = new FrontmatterManager();
            fm.set('title', 'Hello World');
            fm.set('published', true);

            const output = fm.toString();

            // Should contain the delimiters and keys
            expect(output).toContain('---\n');
            expect(output).toContain('title: Hello World');
            expect(output).toContain('published: true');
        });

        it('should quote wiki-links automatically', () => {
            const fm = new FrontmatterManager();

            // Use your special logic
            fm.set('source', '[[My Source Note]]');

            const output = fm.toString();

            // Expect quotes around the link: "[[My Source Note]]"
            expect(output).toContain('source: "[[My Source Note]]"');
        });

        it('should format arrays correctly', () => {
            const fm = new FrontmatterManager();
            fm.set('aliases', ['Note A', 'Note B']);

            const output = fm.toString();

            // Check for list format
            expect(output).toContain('aliases:\n');
            expect(output).toContain('  - Note A');
            expect(output).toContain('  - Note B');
        });

        it('should handle empty arrays', () => {
            const fm = new FrontmatterManager();
            fm.set('emptyList', []);

            expect(fm.toString()).toContain('emptyList: []');
        });
    });
});