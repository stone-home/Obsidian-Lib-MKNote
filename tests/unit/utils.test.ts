import {
    generateDate,
    sanitizeFilename,
    isValidNoteType,
    parseTags,
    capitalize,
    truncate
} from '../../src/utils';

describe('Utils', () => {
    test('generateDate should return YYYY-MM-DD by default', () => {
        const date = generateDate();
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/); //
    });

    test('sanitizeFilename should remove OS-invalid characters', () => {
        expect(sanitizeFilename('My Note: Part 1?')).toBe('My-Note-Part-1'); //
        expect(sanitizeFilename('  multi  space  ')).toBe('multi-space'); //
    });

    test('isValidNoteType should only accept known Zettel types', () => {
        expect(isValidNoteType('fleeting')).toBe(true); //
        expect(isValidNoteType('literature')).toBe(true); //
        expect(isValidNoteType('unknown')).toBe(false); //
    });

    test('parseTags should clean comma-separated strings', () => {
        const input = 'pkm, obsidian , , coding';
        expect(parseTags(input)).toEqual(['pkm', 'obsidian', 'coding']); //
    });

    test('truncate should add ellipsis to long strings', () => {
        expect(truncate('This is a very long title', 10)).toBe('This is...'); //
        expect(truncate('Short', 10)).toBe('Short'); //
    });
});