import { useState, useCallback } from 'react';
import { Note, NoteTag } from '@/types/note';

const generateId = () => Math.random().toString(36).substring(2, 15);

const initialNotes: Note[] = [
  {
    id: '1',
    title: 'Welcome to Mindful Muse',
    content: `# Welcome to Mindful Muse

Mindful Muse is your **modern** note-taking companion. Write your thoughts and organize them with ease.

## Getting Started

- Create a new note using the **+** button
- Use *markdown* formatting for rich text
- Organize notes with **tags**

## Features

1. Rich markdown support
2. Tag-based organization
3. Secure cloud storage
4. Beautiful, responsive design

\`\`\`
// Your notes, organized
const mindfulness = "simple + powerful";
\`\`\`

> Start writing and let Mindful Muse help you stay organized.`,
    tags: ['ideas'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Meeting Notes - Q1 Planning',
    content: `## Q1 Planning Meeting

Discussed the roadmap for Q1. **Key priorities** include:

1. Launch new user onboarding flow
2. Improve performance metrics
3. Expand to two new markets

### Action Items

- [ ] Sarah to prepare mockups by Friday
- [ ] Team to review competitor analysis
- [ ] Schedule follow-up for next Tuesday

*Next meeting: January 21st*`,
    tags: ['work', 'todo'],
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
  },
];

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(initialNotes[0]?.id || null);
  const [selectedTag, setSelectedTag] = useState<NoteTag | null>(null);

  const activeNote = notes.find((note) => note.id === activeNoteId) || null;

  const filteredNotes = selectedTag
    ? notes.filter((note) => note.tags.includes(selectedTag))
    : notes;

  const createNote = useCallback(() => {
    const newNote: Note = {
      id: generateId(),
      title: 'Untitled Note',
      content: '',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    return newNote;
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'summary' | 'tags'>>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      )
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(notes.find((n) => n.id !== id)?.id || null);
    }
  }, [activeNoteId, notes]);

  const selectNote = useCallback((id: string) => {
    setActiveNoteId(id);
  }, []);

  const toggleTag = useCallback((noteId: string, tag: NoteTag) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId
          ? {
              ...note,
              tags: note.tags.includes(tag)
                ? note.tags.filter((t) => t !== tag)
                : [...note.tags, tag],
              updatedAt: new Date(),
            }
          : note
      )
    );
  }, []);

  const filterByTag = useCallback((tag: NoteTag | null) => {
    setSelectedTag(tag);
  }, []);

  return {
    notes,
    filteredNotes,
    activeNote,
    activeNoteId,
    selectedTag,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    toggleTag,
    filterByTag,
  };
};