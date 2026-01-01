import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note, NoteTag } from '@/types/note';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useNotes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<NoteTag | null>(null);

  // Fetch notes from Supabase
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error loading notes',
          description: error.message,
        });
        throw error;
      }

      return (data || []).map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        tags: note.tags as NoteTag[],
        createdAt: new Date(note.created_at),
        updatedAt: new Date(note.updated_at),
      })) as Note[];
    },
    enabled: !!user,
  });

  // Set active note to first note when notes load
  useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
      setActiveNoteId(notes[0].id);
    }
  }, [notes, activeNoteId]);

  const activeNote = notes.find((note) => note.id === activeNoteId) || null;

  const filteredNotes = selectedTag
    ? notes.filter((note) => note.tags.includes(selectedTag))
    : notes;

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const newNote = {
        user_id: user.id,
        title: '',
        content: '',
        tags: [],
      };

      const { data, error } = await supabase
        .from('notes')
        .insert(newNote)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes', user?.id] });
      setActiveNoteId(data.id);
      toast({
        title: 'Note created',
        description: 'New note created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error creating note',
        description: error.message,
      });
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Pick<Note, 'title' | 'content' | 'tags'>>;
    }) => {
      const { error } = await supabase
        .from('notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', user?.id] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating note',
        description: error.message,
      });
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['notes', user?.id] });
      if (activeNoteId === deletedId) {
        const remainingNotes = notes.filter((n) => n.id !== deletedId);
        setActiveNoteId(remainingNotes[0]?.id || null);
      }
      toast({
        title: 'Note deleted',
        description: 'Note deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error deleting note',
        description: error.message,
      });
    },
  });

  const createNote = useCallback(() => {
    createNoteMutation.mutate();
  }, [createNoteMutation]);

  const updateNote = useCallback(
    (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'tags'>>) => {
      updateNoteMutation.mutate({ id, updates });
    },
    [updateNoteMutation]
  );

  const deleteNote = useCallback(
    (id: string) => {
      deleteNoteMutation.mutate(id);
    },
    [deleteNoteMutation]
  );

  const selectNote = useCallback((id: string) => {
    setActiveNoteId(id);
  }, []);

  const toggleTag = useCallback(
    (noteId: string, tag: NoteTag) => {
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;

      const newTags = note.tags.includes(tag)
        ? note.tags.filter((t) => t !== tag)
        : [...note.tags, tag];

      updateNoteMutation.mutate({
        id: noteId,
        updates: { tags: newTags },
      });
    },
    [notes, updateNoteMutation]
  );

  const filterByTag = useCallback((tag: NoteTag | null) => {
    setSelectedTag(tag);
  }, []);

  return {
    notes,
    filteredNotes,
    activeNote,
    activeNoteId,
    selectedTag,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    toggleTag,
    filterByTag,
  };
};
