// src/components/ai/ChatMessageContent.tsx
import React, { useMemo } from 'react';
import { normalizeMarkdownSafe, parseMarkdownWithMath } from '../../utils/math';

interface ChatMessageContentProps {
  content: string;
  isUser?: boolean;
}

export const ChatMessageContent: React.FC<ChatMessageContentProps> = ({ content, isUser }) => {
  const parsedHtml = useMemo(() => {
    if (isUser) return '';
    try {
      const normalized = normalizeMarkdownSafe(content);
      return parseMarkdownWithMath(normalized, { mode: 'katex', breaks: true });
    } catch {
      return content;
    }
  }, [content, isUser]);

  if (isUser) {
    return <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{content}</div>;
  }

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
