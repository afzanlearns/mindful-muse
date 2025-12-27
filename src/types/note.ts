export type NoteTag = 'work' | 'personal' | 'ideas' | 'todo';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: NoteTag[];
  createdAt: Date;
  updatedAt: Date;
  summary?: string;
}

export const TAG_CONFIG: Record<NoteTag, { label: string; className: string }> = {
  work: { label: 'Work', className: 'tag-work' },
  personal: { label: 'Personal', className: 'tag-personal' },
  ideas: { label: 'Ideas', className: 'tag-ideas' },
  todo: { label: 'To-Do', className: 'tag-todo' },
};