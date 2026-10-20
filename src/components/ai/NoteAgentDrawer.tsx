// src/components/ai/NoteAgentDrawer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Bot,
  User,
  Undo2,
  Key,
  Check
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
  { id: 'FORMAT', label: '✨ Format & Structure', prompt: 'Format and organize this note cleanly with clear headings and bullet points.' },
  { id: 'POLISH', label: '🪄 Fix Grammar & Flow', prompt: 'Polish grammar, spelling, punctuation, and phrasing across this note.' },
  { id: 'CHECKLIST', label: '📋 Create Checklist', prompt: 'Extract and convert all actionable tasks into a checklist with checkboxes.' },
  { id: 'SUMMARIZE', label: '⚡ Executive Summary', prompt: 'Add an executive summary with key takeaways at the top of the note.' },
  { id: 'CONCISE', label: '✂️ Make Concise', prompt: 'Condense this note. Cut wordiness and repetition without losing any facts.' },
  { id: 'TABLE', label: '📊 Convert to Table', prompt: 'Organize data or comparative points in this note into a clean Markdown table.' },
  { id: 'EXPAND', label: '💡 Suggest Next Steps', prompt: 'Suggest concrete next steps, open questions, and milestones for this note.' },
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
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [keySaved, setKeySaved] = useState(false);

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
          content: 'Unable to reach the AI model right now. Please check your network or API key.',
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

  const handleSaveApiKey = () => {
    aiNoteAgentService.setCustomApiKey(customKeyInput.trim() || null);
    setKeySaved(true);
    setTimeout(() => {
      setKeySaved(false);
      setShowKeyModal(false);
    }, 1200);
  };

  const wordCount = noteContent
    ? noteContent.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <aside
      aria-label="KNotes AI Copilot"
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        right: 0,
        zIndex: 1300,
        width: isMobile ? '100%' : '540px',
        backgroundColor: isDark ? 'rgba(3, 7, 18, 0.55)' : 'rgba(248, 250, 252, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: isMobile ? '8px' : '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.25)',
        transition: 'all 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      {/* Double-Bezel Outer Shell */}
      <div
        style={{
          height: '100%',
          width: '100%',
          borderRadius: '2rem',
          padding: '6px',
          background: isDark
            ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03), rgba(14, 165, 233, 0.15))'
            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(226, 232, 240, 0.8), rgba(14, 165, 233, 0.15))',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(203, 213, 225, 0.8)',
          boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Double-Bezel Inner Core */}
        <div
          style={{
            height: '100%',
            width: '100%',
            borderRadius: 'calc(2rem - 6px)',
            backgroundColor: isDark ? '#080d1a' : '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: isDark
              ? 'inset 0 1px 1px rgba(255, 255, 255, 0.08)'
              : 'inset 0 1px 1px rgba(255, 255, 255, 0.8)',
          }}
        >
          {/* Header */}
          <header
            style={{
              padding: '14px 18px',
              borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.015)' : 'rgba(248, 250, 252, 0.7)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(14, 165, 233, 0.35)',
                }}
              >
                <Sparkles size={16} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '14.5px',
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      color: isDark ? '#f8fafc' : '#0f172a',
                    }}
                  >
                    KNotes AI Copilot
                  </h2>
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 700,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    Online
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      color: isDark ? '#94a3b8' : '#64748b',
                    }}
                  >
                    {aiNoteAgentService.getActiveEngineName()}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setShowKeyModal(!showKeyModal)}
                title="Configure Gemini API Key"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '7px',
                  borderRadius: '50%',
                  color: isDark ? '#94a3b8' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                }}
              >
                <Key size={16} />
              </button>

              <button
                type="button"
                onClick={handleResetChat}
                title="Reset conversation"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '7px',
                  borderRadius: '50%',
                  color: isDark ? '#94a3b8' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                }}
              >
                <RotateCcw size={16} />
              </button>

              <button
                type="button"
                onClick={onClose}
                title="Close Assistant"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '7px',
                  borderRadius: '50%',
                  color: isDark ? '#94a3b8' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </header>

          {/* API Key Modal Bar if Toggled */}
          {showKeyModal && (
            <div
              style={{
                padding: '12px 18px',
                backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Gemini API Key</span>
                <span style={{ fontSize: '10.5px', color: '#64748b' }}>Leave blank to use default key</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="password"
                  placeholder="Paste Gemini API key..."
                  defaultValue={localStorage.getItem('knotes_gemini_api_key') || ''}
                  onChange={(e) => setCustomKeyInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.4)',
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    color: 'inherit',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#0ea5e9',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {keySaved ? <Check size={14} /> : 'Save'}
                </button>
              </div>
            </div>
          )}

          {/* Active Note Context Strip */}
          <div
            style={{
              padding: '8px 18px',
              backgroundColor: isDark ? 'rgba(14, 165, 233, 0.06)' : 'rgba(14, 165, 233, 0.04)',
              borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.04)' : '1px solid rgba(0, 0, 0, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
              <span style={{ color: '#0ea5e9', fontWeight: 600 }}>Editing:</span>
              <span
                style={{
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: isMobile ? '160px' : '260px',
                }}
              >
                {noteTitle || 'Untitled Note'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#64748b' }}>{wordCount} words</span>
              {canUndo && (
                <button
                  type="button"
                  onClick={onUndo}
                  title="Undo last AI modification"
                  style={{
                    background: 'none',
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    color: '#0ea5e9',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '10.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Undo2 size={11} /> Undo Edit
                </button>
              )}
            </div>
          </div>

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  {!isUser && (
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
                      }}
                    >
                      <Bot size={15} color="#0ea5e9" />
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
                          padding: '10px 16px',
                          borderRadius: '1.25rem',
                          borderTopRightRadius: '4px',
                          background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                          color: '#ffffff',
                          fontWeight: 500,
                          fontSize: '13.5px',
                          lineHeight: 1.5,
                          boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)',
                        }}
                      >
                        <ChatMessageContent content={message.content} isUser={true} />
                      </div>
                    ) : (
                      <div
                        style={{
                          borderRadius: '1.25rem',
                          borderTopLeftRadius: '4px',
                          padding: '4px',
                          background: isDark
                            ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))'
                            : 'linear-gradient(145deg, #f8fafc, #f1f5f9)',
                          border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0',
                        }}
                      >
                        <div
                          style={{
                            padding: '12px 16px',
                            borderRadius: 'calc(1.25rem - 4px)',
                            borderTopLeftRadius: '2px',
                            backgroundColor: isDark ? '#0b1120' : '#ffffff',
                            color: isDark ? '#f1f5f9' : '#0f172a',
                            boxShadow: isDark
                              ? 'inset 0 1px 1px rgba(255, 255, 255, 0.08)'
                              : 'inset 0 1px 1px rgba(255, 255, 255, 0.8)',
                          }}
                        >
                          <ChatMessageContent content={message.content} isUser={false} />
                        </div>
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
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(14, 165, 233, 0.15)',
                        color: '#0ea5e9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                        border: '1px solid rgba(14, 165, 233, 0.25)',
                      }}
                    >
                      <User size={15} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Live Typing Indicator */}
            {isTyping && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bot size={15} color="#0ea5e9" />
                </div>
                <div
                  style={{
                    padding: '8px 16px',
                    borderRadius: '1rem',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
                    fontSize: '12.5px',
                    color: '#64748b',
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

          {/* Quick Action Chips */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.015)' : 'rgba(248, 250, 252, 0.6)',
            }}
          >
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: isDark ? '#64748b' : '#94a3b8',
                marginBottom: '8px',
              }}
            >
              Quick Note Actions:
            </div>
            <div
              style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                paddingBottom: '4px',
                scrollbarWidth: 'none',
              }}
            >
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleSend(action.prompt, action.id)}
                  disabled={isTyping}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
                    color: isDark ? '#e2e8f0' : '#1e293b',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: isTyping ? 'not-allowed' : 'pointer',
                    opacity: isTyping ? 0.5 : 1,
                    transition: 'all 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isTyping) {
                      e.currentTarget.style.borderColor = '#0ea5e9';
                      e.currentTarget.style.color = '#0ea5e9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isTyping) {
                      e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0';
                      e.currentTarget.style.color = isDark ? '#e2e8f0' : '#1e293b';
                    }
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Input Bar */}
          <footer
            style={{
              padding: '12px 16px 16px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
              borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            {/* Input with nested Button-in-Button Send */}
            <div
              style={{
                borderRadius: '9999px',
                padding: '3px',
                background: isDark
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(14, 165, 233, 0.2))'
                  : 'linear-gradient(135deg, #e2e8f0, rgba(14, 165, 233, 0.2))',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
              }}
            >
              <div
                style={{
                  borderRadius: '9999px',
                  backgroundColor: isDark ? '#050914' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px 4px 2px 14px',
                }}
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping}
                  placeholder="Ask AI to format, edit, rewrite, or summarize..."
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    padding: '8px 4px',
                    fontSize: '13.5px',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontFamily: 'inherit',
                  }}
                />

                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isTyping}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: !inputValue.trim() || isTyping ? 'not-allowed' : 'pointer',
                    opacity: !inputValue.trim() || isTyping ? 0.4 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(14, 165, 233, 0.35)',
                    transition: 'all 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
                    flexShrink: 0,
                  }}
                >
                  <Send size={15} />
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '10px',
                color: isDark ? '#64748b' : '#94a3b8',
                marginTop: '6px',
                padding: '0 4px',
              }}
            >
              <span>Edits and format suggestions are previewed first</span>
              <span>Press Enter to send</span>
            </div>
          </footer>
        </div>
      </div>
    </aside>
  );
};
