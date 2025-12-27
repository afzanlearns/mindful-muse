import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Note, NoteTag } from '@/types/note';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { TagFilter } from './TagFilter';
import { TagBadge } from './TagBadge';

interface NotesSidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  selectedTag: NoteTag | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  onFilterByTag: (tag: NoteTag | null) => void;
  className?: string;
  additionalHeaderAction?: React.ReactNode;
}

export const NotesSidebar = ({
  notes,
  activeNoteId,
  selectedTag,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onFilterByTag,
  className,
  additionalHeaderAction,
}: NotesSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <aside className={cn("w-72 h-full bg-sidebar border-r border-sidebar-border flex flex-col dark:glow-border", className)}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-serif text-xl text-foreground">Muse</h1>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ai"
              size="icon-sm"
              onClick={onCreateNote}
              className="rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
            {additionalHeaderAction}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50 border-border/50 focus:bg-background transition-colors"
          />
        </div>
      </div>

      {/* Tag Filter */}
      <TagFilter selectedTag={selectedTag} onSelectTag={onFilterByTag} />

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence mode="popLayout">
          {filteredNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-muted-foreground"
            >
              <FileText className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notes found</p>
            </motion.div>
          ) : (
            filteredNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ delay: index * 0.05 }}
                onMouseEnter={() => setHoveredNoteId(note.id)}
                onMouseLeave={() => setHoveredNoteId(null)}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectNote(note.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectNote(note.id);
                    }
                  }}
                  className={cn(
                    'w-full text-left p-3 rounded-lg mb-1 transition-all duration-200 group relative cursor-pointer',
                    activeNoteId === note.id
                      ? 'bg-accent text-accent-foreground dark:ai-glow'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate mb-1">
                        {note.title || 'Untitled'}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                        {note.content.replace(/[#*`_\[\]]/g, '').slice(0, 80) || 'No content yet...'}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground/70">
                          {formatDate(note.updatedAt)}
                        </span>
                        {note.tags.map((tag) => (
                          <TagBadge key={tag} tag={tag} size="sm" />
                        ))}
                      </div>
                    </div>

                    <AnimatePresence>
                      {hoveredNoteId === note.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute right-2 top-2"
                        >
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteNote(note.id);
                            }}
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {note.summary && (
                    <div className="mt-2 pt-2 border-t border-border/30">
                      <span className="text-[10px] uppercase tracking-wider text-primary/70 font-medium">
                        AI Summary
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center">
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </p>
      </div>
    </aside>
  );
};