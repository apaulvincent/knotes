// src/components/ai/NoteAgentDrawer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useTheme, useMediaQuery, IconButton, Tooltip } from '@mui/material';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Bot,
  User,
  Undo2,
  Type,
  ListTodo,
  FileText,
  Minimize2,
  Table as TableIcon
} from 'lucide-react';
import {
  aiNoteAgentService,
  NoteAgentMessage
} from '../../services/aiNoteAgentService';
import { ChatMessageContent } from './ChatMessageContent';
import { NoteProposalCard } from './NoteProposalCard';

interface NoteAgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  noteTitle: string;
  noteContent: string;
  onApplyContent: (newContent: string, newTitle?: string | null) => void;
  onAppendContent: (appendedContent: string) => void;
  canUndo?: boolean;
  onUndo?: () => void;
}

const QUICK_ACTIONS = [
  { id: 'FORMAT', icon: Sparkles, label: 'Format', prompt: 'Format and organize this note cleanly with clear headings and bullet points.' },
  { id: 'POLISH', icon: Type, label: 'Polish', prompt: 'Polish grammar, spelling, punctuation, and phrasing across this note.' },
  { id: 'CHECKLIST', icon: ListTodo, label: 'Checklist', prompt: 'Extract and convert all actionable tasks into a checklist with checkboxes.' },
  { id: 'SUMMARIZE', icon: FileText, label: 'Summary', prompt: 'Add a concise summary with key takeaways at the top of the note.' },
  { id: 'CONCISE', icon: Minimize2, label: 'Concise', prompt: 'Condense this note. Cut wordiness and repetition without losing any facts.' },
  { id: 'TABLE', icon: TableIcon, label: 'Table', prompt: 'Organize data or comparative points in this note into a clean Markdown table.' },
] as const;

export const NoteAgentDrawer: React.FC<NoteAgentDrawerProps> = ({
  isOpen,
  onClose,
  noteTitle,
  noteContent,
  onApplyContent,
  onAppendContent,
  canUndo,
  onUndo,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [messages, setMessages] = useState<NoteAgentMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "I'm your note assistant. I can edit, format, restructure, clean grammar, or generate summaries for your open note. Choose an action below or tell me what to change.",
      createdAt: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (actionPrompt?: string, actionType?: any) => {
    const text = (actionPrompt || inputValue).trim();
    if (!text || isTyping) return;

    const userMsg: NoteAgentMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text,
      createdAt: new Date(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const reply = await aiNoteAgentService.sendMessage({
        messages: nextMessages,
        noteTitle,
        noteContent,
        actionType,
        customPrompt: text,
      });

      setMessages((prev) => [...prev, reply]);
    } catch (err: any) {
      console.error('Agent message error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: 'Unable to reach the AI model right now. Please check your network connection.',
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content:
          "Conversation reset. What changes or formatting would you like to apply to this note?",
        createdAt: new Date(),
      },
    ]);
  };

  return (
    <aside
      aria-label="KNotes AI Copilot"
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        right: 0,
        zIndex: 1300,
        width: isMobile ? '100%' : '440px',
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        borderLeft: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isDark
          ? '-4px 0 24px rgba(0, 0, 0, 0.4)'
          : '-4px 0 20px rgba(0, 0, 0, 0.08)',
        color: isDark ? '#f8fafc' : '#0f172a',
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      {/* Header matching KNotes AppBar */}
      <header
        style={{
          height: '60px',
          padding: '0 16px',
          borderBottom: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: isDark ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.1)',
              border: isDark ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid rgba(14, 165, 233, 0.2)',
              color: '#0ea5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={17} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: isDark ? '#f8fafc' : '#0f172a',
                  letterSpacing: '-0.01em',
                }}
              >
                KNotes AI Copilot
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                Online
              </span>
            </div>
            <div style={{ fontSize: '10.5px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '1px' }}>
              {aiNoteAgentService.getActiveEngineName()}
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {canUndo && (
            <Tooltip title="Undo last AI edit">
              <IconButton
                size="small"
                onClick={onUndo}
                sx={{
                  color: '#0ea5e9',
                  bgcolor: isDark ? 'rgba(14, 165, 233, 0.12)' : 'rgba(14, 165, 233, 0.08)',
                  border: '1px solid rgba(14, 165, 233, 0.25)',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(14, 165, 233, 0.2)' : 'rgba(14, 165, 233, 0.15)',
                  },
                }}
              >
                <Undo2 size={15} />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Reset conversation">
            <IconButton
              size="small"
              onClick={handleResetChat}
              sx={{ color: isDark ? '#94a3b8' : '#64748b' }}
            >
              <RotateCcw size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Close">
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: isDark ? '#94a3b8' : '#64748b' }}
            >
              <X size={18} />
            </IconButton>
          </Tooltip>
        </div>
      </header>

      {/* Messages Stream */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
              }}
            >
              {!isUser && (
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    backgroundColor: isDark ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                  }}
                >
                  <Bot size={14} color="#0ea5e9" />
                </div>
              )}

              <div
                style={{
                  maxWidth: '88%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                }}
              >
                {isUser ? (
                  <div
                    style={{
                      padding: '9px 14px',
                      borderRadius: '12px 12px 2px 12px',
                      backgroundColor: '#0ea5e9',
                      color: '#ffffff',
                      fontWeight: 500,
                      fontSize: '13px',
                      lineHeight: 1.5,
                      boxShadow: '0 2px 6px rgba(14, 165, 233, 0.25)',
                    }}
                  >
                    <ChatMessageContent content={message.content} isUser={true} />
                  </div>
                ) : (
                  <div
                    style={{
                      borderRadius: '12px 12px 12px 2px',
                      padding: '10px 14px',
                      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    }}
                  >
                    <ChatMessageContent content={message.content} isUser={false} />
                  </div>
                )}

                {/* Proposal Card if formatted content was generated */}
                {message.proposal && (
                  <div style={{ width: '100%' }}>
                    <NoteProposalCard
                      proposal={message.proposal}
                      onApply={(html, title) => onApplyContent(html, title)}
                      onAppend={(html) => onAppendContent(html)}
                    />
                  </div>
                )}
              </div>

              {isUser && (
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                    color: '#0ea5e9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                  }}
                >
                  <User size={14} />
                </div>
              )}
            </div>
          );
        })}

        {/* Live Typing Indicator */}
        {isTyping && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                backgroundColor: isDark ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              }}
            >
              <Bot size={14} color="#0ea5e9" />
            </div>
            <div
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                fontSize: '12px',
                color: isDark ? '#94a3b8' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Formatting & analyzing note</span>
              <span
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: '#0ea5e9',
                  display: 'inline-block',
                  animation: 'pulse 1s infinite',
                }}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions 3-Column Micro Grid */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
          }}
        >
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => handleSend(action.prompt, action.id)}
                disabled={isTyping}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  padding: '6px 4px',
                  borderRadius: '6px',
                  backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                  color: isDark ? '#e2e8f0' : '#1e293b',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: isTyping ? 'not-allowed' : 'pointer',
                  opacity: isTyping ? 0.5 : 1,
                  transition: 'all 0.15s ease',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!isTyping) {
                    e.currentTarget.style.borderColor = '#0ea5e9';
                    e.currentTarget.style.color = '#38bdf8';
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(14, 165, 233, 0.1)' : 'rgba(14, 165, 233, 0.06)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isTyping) {
                    e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0';
                    e.currentTarget.style.color = isDark ? '#e2e8f0' : '#1e293b';
                    e.currentTarget.style.backgroundColor = isDark ? '#0f172a' : '#f8fafc';
                  }
                }}
              >
                <Icon size={12} color="#0ea5e9" style={{ flexShrink: 0 }} />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Input Bar */}
      <footer
        style={{
          padding: '10px 16px 14px',
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderTop: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            borderRadius: '8px',
            border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
            backgroundColor: isDark ? '#0f172a' : '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            padding: '3px 4px 3px 12px',
            transition: 'border-color 0.2s',
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            placeholder="Ask AI to format, edit, or structure..."
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '6px 0',
              fontSize: '13px',
              color: isDark ? '#f8fafc' : '#0f172a',
              fontFamily: 'inherit',
            }}
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isTyping}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: '#0ea5e9',
              color: '#ffffff',
              border: 'none',
              cursor: !inputValue.trim() || isTyping ? 'not-allowed' : 'pointer',
              opacity: !inputValue.trim() || isTyping ? 0.4 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
              flexShrink: 0,
            }}
          >
            <Send size={14} />
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '10px',
            color: isDark ? '#94a3b8' : '#64748b',
            marginTop: '5px',
          }}
        >
          <span>Edits are previewed first</span>
          <span>Press Enter to send</span>
        </div>
      </footer>
    </aside>
  );
};
