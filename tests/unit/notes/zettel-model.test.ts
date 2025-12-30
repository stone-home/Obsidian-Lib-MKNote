import { ZettelNoteModel } from '../../../src/notes/model';

const mockAdapter = {
    read: jest.fn(),
    write: jest.fn(),
    exists: jest.fn(),
    move: jest.fn(),
    delete: jest.fn(),
    rename: jest.fn(),
    getFrontmatter: jest.fn()
};

describe('ZettelNoteModel', () => {
    it('addSourceToProps should deduplicate links', () => {
        const note = new ZettelNoteModel(mockAdapter as any, 'test.md');
        note.addSourceToProps('[[Source A]]');
        note.addSourceToProps(['[[Source A]]', '[[Source B]]']); //

        expect(note.properties.get('sources')).toEqual(['[[Source A]]', '[[Source B]]']); //
    });

    it('addRelevantNote should queue a link update for the target', () => {
        const sourceNote = new ZettelNoteModel(mockAdapter as any, 'source.md');
        const targetNote = new ZettelNoteModel(mockAdapter as any, 'target.md');

        sourceNote.addRelevantNote(targetNote); //

        expect(sourceNote.relevantNotes.length).toBe(1); //
        expect(sourceNote.relevantNotes[0].targetNote).toBe(targetNote); //
    });
});