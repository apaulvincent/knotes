// src/components/ai/ChatMessageContent.tsx
import React, { useMemo } from 'react';
import { marked } from 'marked';

interface ChatMessageContentProps {
  content: string;
  isUser?: boolean;
}

export const ChatMessageContent: React.FC<ChatMessageContentProps> = ({ content, isUser }) => {
  if (isUser) {
    return <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{content}</div>;
  }

  const parsedHtml = useMemo(() => {
    try {
      let normalized = content;
      if (normalized && (normalized.includes('\\n') || normalized.includes('\\r'))) {
        normalized = normalized.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\r/g, '\n');
      }
      if (normalized && normalized.includes('\\t')) {
        normalized = normalized.replace(/\\t/g, '\t');
      }
      return marked.parse(normalized, { breaks: true, gfm: true }) as string;
    } catch {
      return content;
    }
  }, [content]);

  return (
    <div
      className="chat-ai-markdown"
      style={{
        fontSize: '14px',
        lineHeight: 1.65,
        wordBreak: 'break-word',
      }}
      dangerouslySetInnerHTML={{ __html: parsedHtml }}
    />
  );
};
