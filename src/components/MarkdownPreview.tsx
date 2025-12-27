import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export const MarkdownPreview = ({ content, className }: MarkdownPreviewProps) => {
  return (
    <div className={cn('markdown-content', className)}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};