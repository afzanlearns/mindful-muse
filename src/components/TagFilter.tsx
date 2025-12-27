import { motion } from 'framer-motion';
import { Tag, X } from 'lucide-react';
import { NoteTag, TAG_CONFIG } from '@/types/note';
import { TagBadge } from './TagBadge';
import { cn } from '@/lib/utils';

interface TagFilterProps {
  selectedTag: NoteTag | null;
  onSelectTag: (tag: NoteTag | null) => void;
}

export const TagFilter = ({ selectedTag, onSelectTag }: TagFilterProps) => {
  const tags = Object.keys(TAG_CONFIG) as NoteTag[];

  return (
    <div className="px-4 py-3 border-b border-sidebar-border">
      <div className="flex items-center gap-2 mb-2">
        <Tag className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Filter by tag</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <motion.div
            key={tag}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TagBadge
              tag={tag}
              size="sm"
              onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
              selected={selectedTag === tag}
            />
          </motion.div>
        ))}
        {selectedTag && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => onSelectTag(null)}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full',
              'bg-muted text-muted-foreground hover:bg-muted/80 transition-colors'
            )}
          >
            <X className="h-3 w-3" />
            Clear
          </motion.button>
        )}
      </div>
    </div>
  );
};