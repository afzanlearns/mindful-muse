import { motion } from 'framer-motion';
import { Tag, Plus, Check } from 'lucide-react';
import { NoteTag, TAG_CONFIG } from '@/types/note';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TagSelectorProps {
  selectedTags: NoteTag[];
  onToggleTag: (tag: NoteTag) => void;
}

export const TagSelector = ({ selectedTags, onToggleTag }: TagSelectorProps) => {
  const tags = Object.keys(TAG_CONFIG) as NoteTag[];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <Tag className="h-3.5 w-3.5" />
          <span className="text-xs">
            {selectedTags.length > 0 ? `${selectedTags.length} tags` : 'Add tags'}
          </span>
          <Plus className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="space-y-1">
          {tags.map((tag) => {
            const config = TAG_CONFIG[tag];
            const isSelected = selectedTags.includes(tag);
            
            return (
              <motion.button
                key={tag}
                whileHover={{ x: 2 }}
                onClick={() => onToggleTag(tag)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                  isSelected ? 'bg-accent' : 'hover:bg-muted'
                )}
              >
                <span className={cn(config.className, 'px-2 py-0.5 rounded-full text-xs border')}>
                  {config.label}
                </span>
                {isSelected && <Check className="h-4 w-4 text-primary" />}
              </motion.button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};