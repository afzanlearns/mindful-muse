import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Eye, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Note, NoteTag } from '@/types/note';
import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { TagSelector } from './TagSelector';
import { TagBadge } from './TagBadge';
import { MarkdownPreview } from './MarkdownPreview';

interface NoteEditorProps {
  note: Note | null;
  onUpdateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => void;
  onToggleTag: (noteId: string, tag: NoteTag) => void;
}

export const NoteEditor = ({ note, onUpdateNote, onToggleTag }: NoteEditorProps) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update local state when note changes
  useEffect(() => {
    if (note) {
      setLocalTitle(note.title);
      setLocalContent(note.content);
    }
  }, [note?.id]); // Only reset when note ID changes

  useEffect(() => {
    setIsPreviewMode(false);
  }, [note?.id]);

  // Debounced save function
  const debouncedSave = useCallback((noteId: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      onUpdateNote(noteId, updates);
    }, 500); // Save 500ms after user stops typing
  }, [onUpdateNote]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const autoResizeTextarea = () => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [localContent]);

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-serif text-2xl text-foreground mb-2">No note selected</h2>
          <p className="text-muted-foreground">
            Select a note from the sidebar or create a new one
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Editor Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b border-border/50"
      >
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={localTitle}
            onChange={(e) => {
              const newTitle = e.target.value;
              setLocalTitle(newTitle);
              debouncedSave(note.id, { title: newTitle });
            }}
            placeholder="Untitled Note"
            className="w-full bg-transparent font-serif text-2xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2">
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              Last edited {note.updatedAt.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
            <div className="flex items-center gap-1 flex-wrap min-w-0">
              {note.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} size="sm" />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <TagSelector
            selectedTags={note.tags}
            onToggleTag={(tag) => onToggleTag(note.id, tag)}
          />

          {/* Preview Toggle */}
          <Button
            variant={isPreviewMode ? 'subtle' : 'ghost'}
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="gap-1.5"
          >
            {isPreviewMode ? (
              <>
                <Edit3 className="h-3.5 w-3.5" />
                <span className="text-xs hidden sm:inline">Edit</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                <span className="text-xs hidden sm:inline">Preview</span>
              </>
            )}
          </Button>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6">
          {/* Note Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <AnimatePresence mode="wait">
              {isPreviewMode ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="min-h-[calc(100vh-300px)]"
                >
                  <MarkdownPreview content={localContent} />
                </motion.div>
              ) : (
                <motion.textarea
                  key="editor"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  ref={contentRef}
                  value={localContent}
                  onChange={(e) => {
                    const newContent = e.target.value;
                    setLocalContent(newContent);
                    debouncedSave(note.id, { content: newContent });
                    autoResizeTextarea();
                  }}
                  placeholder="Start writing with markdown support...

# Heading 1
## Heading 2

**bold** and *italic* text

- Bullet points
- Like this

1. Numbered lists
2. Work too

`inline code` and code blocks:

```
code block
```

> Blockquotes for emphasis"
                  className={cn(
                    'w-full min-h-[calc(100vh-300px)] bg-transparent text-foreground',
                    'placeholder:text-muted-foreground/40 focus:outline-none resize-none',
                    'text-base leading-relaxed font-mono'
                  )}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Status Bar */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-6 py-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground"
      >
        <div className="flex items-center gap-4">
          <span>
            {localContent.split(/\s+/).filter(Boolean).length} words
          </span>
          <span>
            {localContent.length} characters
          </span>
        </div>
        <span className={cn(
          'px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider',
          isPreviewMode ? 'bg-accent text-accent-foreground' : 'bg-muted'
        )}>
          {isPreviewMode ? 'Preview' : 'Markdown'}
        </span>
      </motion.footer>
    </div>
  );
};