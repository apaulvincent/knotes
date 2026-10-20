// src/components/ai/NoteProposalCard.tsx
import React, { useState } from 'react';
import { useTheme } from '@mui/material';
import { ActionProposal } from '../../services/aiNoteAgentService';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  FileCheck,
  PlusCircle,
  Sparkles,
  Type,
  ListTodo,
  Table as TableIcon
} from 'lucide-react';
import { marked } from 'marked';

interface NoteProposalCardProps {
  proposal: ActionProposal;
  onApply: (formattedHtml: string, updatedTitle?: string | null) => void;
  onAppend: (formattedHtml: string) => void;
}

export const NoteProposalCard: React.FC<NoteProposalCardProps> = ({
  proposal,
  onApply,
  onAppend,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [isExpanded, setIsExpanded] = useState(true); // Default open so user can inspect immediately
  const [isApplied, setIsApplied] = useState(false);
  const [isAppended, setIsAppended] = useState(false);
  const [copied, setCopied] = useState(false);

  const cleanMarkdown = React.useMemo(() => {
    if (!proposal.formattedContent) return '';
    let text = proposal.formattedContent;
    if (text.includes('\\n') || text.includes('\\r')) {
      text = text.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\r/g, '\n');
    }
    if (text.includes('\\t')) {
      text = text.replace(/\\t/g, '\t');
    }
    return text;
  }, [proposal.formattedContent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    onApply(proposal.formattedHtml, proposal.updatedTitle);
    setIsApplied(true);
    setIsAppended(false);
  };

  const handleAppend = () => {
    onAppend(proposal.formattedHtml);
    setIsAppended(true);
  };

  const getActionIcon = () => {
    switch (proposal.action) {
      case 'CHECKLIST':
        return <ListTodo size={13} color="#38bdf8" />;
      case 'TABLE':
        return <TableIcon size={13} color="#38bdf8" />;
      case 'POLISH':
        return <Type size={13} color="#38bdf8" />;
      default:
        return <Sparkles size={13} color="#38bdf8" />;
    }
  };

  const originalWords = proposal.originalContent
    ? proposal.originalContent.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length
    : 0;
  const newWords = proposal.formattedContent
    ? proposal.formattedContent.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div
      style={{
        borderRadius: '12px',
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
        boxShadow: isDark
          ? '0 4px 16px rgba(0, 0, 0, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.05)',
        marginTop: '12px',
        marginBottom: '12px',
        overflow: 'hidden',
        color: isDark ? '#f8fafc' : '#0f172a',
      }}
    >
      {/* Card Header */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              backgroundColor: isDark ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: isDark ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid rgba(14, 165, 233, 0.2)',
            }}
          >
            {getActionIcon()}
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#38bdf8',
            }}
          >
            {proposal.action} PROPOSAL
          </span>
        </div>

        <span
          style={{
            fontSize: '11px',
            fontFamily: '"JetBrains Mono", monospace',
            color: isDark ? '#94a3b8' : '#64748b',
          }}
        >
          {originalWords} → {newWords} words
        </span>
      </div>

      {/* Body Content */}
      <div style={{ padding: '12px 14px' }}>
        {/* Summary */}
        <p
          style={{
            fontSize: '13px',
            lineHeight: 1.5,
            fontWeight: 500,
            margin: '0 0 10px 0',
            color: isDark ? '#e2e8f0' : '#334155',
          }}
        >
          {proposal.summary}
        </p>

        {proposal.updatedTitle && (
          <div
            style={{
              fontSize: '12px',
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: isDark ? 'rgba(14, 165, 233, 0.1)' : 'rgba(14, 165, 233, 0.08)',
              border: isDark ? '1px solid rgba(14, 165, 233, 0.25)' : '1px solid rgba(14, 165, 233, 0.2)',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: isDark ? '#f8fafc' : '#0f172a',
            }}
          >
            <span style={{ fontWeight: 600, color: '#38bdf8' }}>Suggested Title:</span>
            <span>{proposal.updatedTitle}</span>
          </div>
        )}

        {/* Formatted Preview Box with High Contrast */}
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '12px',
                fontWeight: 600,
                color: '#38bdf8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {isExpanded ? (
                <>
                  Hide Formatted Preview <ChevronUp size={14} />
                </>
              ) : (
                <>
                  Show Formatted Preview <ChevronDown size={14} />
                </>
              )}
            </button>
          </div>

          {isExpanded && (
            <div
              className="proposal-preview-box"
              style={{
                marginTop: '6px',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: isDark ? '#060a12' : '#ffffff',
                border: isDark ? '1px solid #1e293b' : '1px solid #cbd5e1',
                maxHeight: '260px',
                overflowY: 'auto',
                fontSize: '13px',
                lineHeight: 1.6,
                color: isDark ? '#f1f5f9' : '#0f172a',
              }}
              dangerouslySetInnerHTML={{
                __html: marked.parse(cleanMarkdown) as string,
              }}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {/* Apply to Note */}
          <button
            type="button"
            onClick={handleApply}
            style={{
              borderRadius: '6px',
              padding: '6px 14px',
              backgroundColor: isApplied ? '#10b981' : '#0ea5e9',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(14, 165, 233, 0.3)',
              transition: 'background-color 0.2s',
            }}
          >
            {isApplied ? <Check size={14} /> : <FileCheck size={14} />}
            <span>{isApplied ? 'Applied to Note!' : 'Replace Note'}</span>
          </button>

          {/* Append Button */}
          <button
            type="button"
            onClick={handleAppend}
            style={{
              borderRadius: '6px',
              padding: '6px 12px',
              backgroundColor: 'transparent',
              color: isDark ? '#38bdf8' : '#0284c7',
              border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0ea5e9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isDark ? '#334155' : '#cbd5e1';
            }}
          >
            <PlusCircle size={14} />
            <span>{isAppended ? 'Appended!' : 'Insert at Bottom'}</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy formatted markdown"
            style={{
              borderRadius: '6px',
              padding: '6px 10px',
              backgroundColor: 'transparent',
              color: isDark ? '#94a3b8' : '#64748b',
              border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s',
            }}
          >
            {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
