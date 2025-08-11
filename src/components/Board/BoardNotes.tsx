import React, { memo, useCallback, useMemo } from 'react';
import { useNotes, useBoardActions } from '@/contexts/BoardContext';
import { NoteItem } from '../Notes/NoteItem';

export const BoardNotes: React.FC = memo(() => {
  const notes = useNotes();
  const { selectNote } = useBoardActions();

  const stableSelectNote = useCallback((noteId: string | null) => {
    selectNote(noteId);
  }, [selectNote]);

  const stableBoardBounds = useMemo(() => {
    return undefined;
  }, []);

  const noteIds = useMemo(() => {
    return notes ? Object.keys(notes) : [];
  }, [notes]);


  const renderedNotes = useMemo(() => {
    if (noteIds.length === 0) return null;
    
    return noteIds.map((noteId) => (
      <NoteItem
        key={noteId}
        noteId={noteId}
        onSelect={stableSelectNote}
        boardBounds={stableBoardBounds}
      />
    ));
  }, [noteIds, stableSelectNote, stableBoardBounds]);

  return <>{renderedNotes}</>;
});

BoardNotes.displayName = 'BoardNotes'; 