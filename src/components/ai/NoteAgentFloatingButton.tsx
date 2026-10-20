// src/components/ai/NoteAgentFloatingButton.tsx
import React from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { Sparkles } from 'lucide-react';

interface NoteAgentFloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
  noteTitle?: string;
}

export const NoteAgentFloatingButton: React.FC<NoteAgentFloatingButtonProps> = ({
  isOpen,
  onClick,
  noteTitle,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isOpen) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: isMobile ? 74 : 92,
        right: isMobile ? 12 : 24,
        zIndex: 35,
        userSelect: 'none',
      }}
    >
      {/* Outer Machined Ring with Ambient Sky / Violet Glow */}
      <div
        style={{
          borderRadius: '9999px',
          padding: '2.5px',
          background: isDark
            ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.4), rgba(99, 102, 241, 0.25), rgba(14, 165, 233, 0.35))'
            : 'linear-gradient(135deg, rgba(14, 165, 233, 0.35), rgba(224, 231, 255, 0.8), rgba(14, 165, 233, 0.25))',
          boxShadow: isDark
            ? '0 10px 25px -5px rgba(14, 165, 233, 0.3), 0 0 15px rgba(14, 165, 233, 0.15)'
            : '0 10px 25px -5px rgba(14, 165, 233, 0.25), 0 0 12px rgba(14, 165, 233, 0.1)',
          border: isDark ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid rgba(14, 165, 233, 0.25)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
        className="group-hover-float"
      >
        <button
          type="button"
          onClick={onClick}
          aria-label="Open AI Note Assistant"
          title={`Ask AI to edit, format, or structure ${noteTitle ? `"${noteTitle}"` : 'this note'}`}
          style={{
            borderRadius: '9999px',
            padding: isMobile ? '6px 12px' : '7px 16px',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)',
            boxShadow: isDark
              ? 'inset 0 1px 1px rgba(255, 255, 255, 0.12)'
              : 'inset 0 1px 1px rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '8px' : '10px',
            color: isDark ? '#f8fafc' : '#0f172a',
            border: 'none',
            cursor: 'pointer',
            fontFamily: '"Plus Jakarta Sans", "Outfit", -apple-system, sans-serif',
            transition: 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.97)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
        >
          {/* Button-in-Button Nested Circular Badge */}
          <div
            style={{
              width: isMobile ? '24px' : '28px',
              height: isMobile ? '24px' : '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(14, 165, 233, 0.4)',
              flexShrink: 0,
            }}
          >
            <Sparkles size={isMobile ? 14 : 16} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.15 }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                fontSize: isMobile ? '12px' : '13px',
                letterSpacing: '-0.01em',
              }}
            >
              Ask AI
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 6px #10b981',
                  display: 'inline-block',
                }}
              />
            </span>
            {!isMobile && (
              <span
                style={{
                  fontSize: '9.5px',
                  color: isDark ? '#94a3b8' : '#64748b',
                  fontWeight: 500,
                  marginTop: '1.5px',
                  letterSpacing: '0.01em',
                }}
              >
                Format & Edit Note
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
