// src/components/ai/NoteProposalCard.tsx
import React, { useState } from 'react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isAppended, setIsAppended] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(proposal.formattedContent);
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
        return <ListTodo size={14} className="text-sky-400" />;
      case 'TABLE':
        return <TableIcon size={14} className="text-sky-400" />;
      case 'POLISH':
        return <Type size={14} className="text-sky-400" />;
      default:
        return <Sparkles size={14} className="text-sky-400" />;
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
        borderRadius: '1.25rem',
        padding: '5px',
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(99, 102, 241, 0.15), rgba(14, 165, 233, 0.1))',
        boxShadow: '0 12px 32px -8px rgba(14, 165, 233, 0.15)',
        border: '1px solid rgba(14, 165, 233, 0.25)',
        marginTop: '12px',
        marginBottom: '12px',
        transition: 'all 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      <div
        style={{
          borderRadius: 'calc(1.25rem - 4px)',
          backgroundColor: 'var(--mui-palette-background-paper, #ffffff)',
          padding: '14px',
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Eyebrow & Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(14, 165, 233, 0.3)',
              }}
            >
              {getActionIcon()}
            </div>
            <span
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                fontWeight: 700,
                color: '#0284c7',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                padding: '2px 8px',
                borderRadius: '9999px',
                border: '1px solid rgba(14, 165, 233, 0.2)',
              }}
            >
              {proposal.action} PROPOSAL
            </span>
          </div>

          <span
            style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#64748b',
            }}
          >
            {originalWords} → {newWords} words
          </span>
        </div>

        {/* Improvement Summary */}
        <p
          style={{
            fontSize: '13px',
            lineHeight: 1.5,
            fontWeight: 500,
            margin: '0 0 10px 0',
            color: 'inherit',
          }}
        >
          {proposal.summary}
        </p>

        {proposal.updatedTitle && (
          <div
            style={{
              fontSize: '12px',
              padding: '6px 10px',
              borderRadius: '8px',
              backgroundColor: 'rgba(14, 165, 233, 0.08)',
              border: '1px solid rgba(14, 165, 233, 0.15)',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontWeight: 600, color: '#0284c7' }}>Suggested Title:</span>
            <span>{proposal.updatedTitle}</span>
          </div>
        )}

        {/* Collapsible Preview */}
        <div style={{ marginBottom: '12px' }}>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '12px',
              fontWeight: 600,
              color: '#0ea5e9',
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
                View Formatted Preview <ChevronDown size={14} />
              </>
            )}
          </button>

          {isExpanded && (
            <div
              style={{
                marginTop: '8px',
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                maxHeight: '260px',
                overflowY: 'auto',
                fontSize: '13px',
                lineHeight: 1.6,
              }}
              dangerouslySetInnerHTML={{
                __html: marked.parse(proposal.formattedContent) as string,
              }}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {/* Apply to Note (Button-in-Button Architecture) */}
          <button
            type="button"
            onClick={handleApply}
            style={{
              borderRadius: '9999px',
              padding: '6px 14px 6px 12px',
              background: isApplied
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isApplied ? <Check size={12} color="#fff" /> : <FileCheck size={12} color="#fff" />}
            </div>
            <span>{isApplied ? 'Applied to Note!' : 'Replace Note'}</span>
          </button>

          {/* Append Button */}
          <button
            type="button"
            onClick={handleAppend}
            style={{
              borderRadius: '9999px',
              padding: '6px 12px',
              backgroundColor: 'rgba(14, 165, 233, 0.08)',
              color: '#0284c7',
              border: '1px solid rgba(14, 165, 233, 0.2)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
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
              borderRadius: '9999px',
              padding: '6px 10px',
              backgroundColor: 'transparent',
              color: '#64748b',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s',
            }}
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
