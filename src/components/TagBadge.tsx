import { cn } from '@/lib/utils';
import { NoteTag, TAG_CONFIG } from '@/types/note';

interface TagBadgeProps {
  tag: NoteTag;
  size?: 'sm' | 'md';
  onClick?: () => void;
  selected?: boolean;
}

export const TagBadge = ({ tag, size = 'sm', onClick, selected }: TagBadgeProps) => {
  const config = TAG_CONFIG[tag];
  const Component = onClick ? 'button' : 'span';
  
  return (
    <Component
      onClick={onClick}
      className={cn(
        'inline-flex items-center border rounded-full font-medium transition-all duration-200',
        config.className,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        onClick && 'cursor-pointer hover:scale-105',
        selected && 'ring-2 ring-primary/50'
      )}
    >
      {config.label}
    </Component>
  );
};