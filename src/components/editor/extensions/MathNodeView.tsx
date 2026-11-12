import { Box, Button, IconButton, Popover, TextField, Tooltip, Typography } from '@mui/material';
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { Check, Trash2, X } from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { formatMathFallbackText, renderKatexHtml } from '../../../utils/math';

interface MathNodeViewProps extends NodeViewProps {
  displayMode: boolean;
}

const MathNodeView = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
  editor,
  displayMode,
}: MathNodeViewProps) => {
  const latex = (node.attrs.latex as string) || '';
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [draft, setDraft] = useState(latex);
  const wrapperRef = useRef<HTMLElement | null>(null);
  const wasSelectedBeforeMouseDownRef = useRef(false);

  const renderedHtml = useMemo(() => renderKatexHtml(latex, displayMode), [latex, displayMode]);
  const previewHtml = useMemo(() => renderKatexHtml(draft, displayMode), [draft, displayMode]);

  const openEditor = () => {
    if (!editor.isEditable) return;
    setDraft(latex);
    setAnchorEl(wrapperRef.current);
  };

  const handleClose = () => {
    setAnchorEl(null);
    editor.commands.focus();
  };

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setAnchorEl(null);
      deleteNode();
      editor.commands.focus();
      return;
    }
    updateAttributes({ latex: trimmed });
    setAnchorEl(null);
    editor.commands.focus();
  };

  const handleDelete = () => {
    setAnchorEl(null);
    deleteNode();
    editor.commands.focus();
  };

  const isOpen = Boolean(anchorEl);

  return (
    <NodeViewWrapper
      as={displayMode ? 'div' : 'span'}
      ref={wrapperRef}
      contentEditable={false}
      className={displayMode ? 'katex-math-block' : 'katex-math-inline'}
      onMouseDown={() => {
        wasSelectedBeforeMouseDownRef.current = selected;
      }}
      onClick={(e: React.MouseEvent) => {
        if (editor.isEditable && wasSelectedBeforeMouseDownRef.current) {
          e.stopPropagation();
          openEditor();
        }
      }}
      onDoubleClick={(e: React.MouseEvent) => {
        if (editor.isEditable) {
          e.stopPropagation();
          openEditor();
        }
      }}
      title={editor.isEditable ? 'Double-click to edit LaTeX' : undefined}
      style={{
        display: displayMode ? 'block' : 'inline-block',
        verticalAlign: displayMode ? undefined : 'baseline',
        textAlign: displayMode ? 'center' : undefined,
        margin: displayMode ? '0.85rem 0' : undefined,
        padding: displayMode ? '0.5rem 0.75rem' : '0 2px',
        borderRadius: displayMode ? '8px' : '4px',
        cursor: editor.isEditable ? 'pointer' : 'default',
        outline: selected ? '1.5px solid #0ea5e9' : 'none',
        backgroundColor: selected ? 'rgba(14, 165, 233, 0.12)' : 'transparent',
        transition: 'background-color 0.15s ease, outline-color 0.15s ease',
        overflowX: displayMode ? 'auto' : undefined,
        maxWidth: '100%',
      }}
    >
      <span
        aria-label={formatMathFallbackText(latex) || latex}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />

      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: displayMode ? 'center' : 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: displayMode ? 'center' : 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              p: 1.5,
              width: { xs: 280, sm: 360 },
              maxWidth: '92vw',
              mt: 0.75,
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            },
          },
        }}
      >
        <Box
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              {displayMode ? 'Edit Block Math (LaTeX)' : 'Edit Inline Math (LaTeX)'}
            </Typography>
            <Tooltip title="Remove math">
              <IconButton size="small" color="error" onClick={handleDelete}>
                <Trash2 size={15} />
              </IconButton>
            </Tooltip>
          </Box>

          <TextField
            size="small"
            fullWidth
            autoFocus
            multiline={displayMode}
            minRows={displayMode ? 2 : 1}
            maxRows={6}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                handleClose();
              } else if (e.key === 'Enter' && (!displayMode || e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSave();
              }
            }}
            placeholder="e.g. 55\text{ }^\circ\text{C}"
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: '0.85rem',
              },
            }}
          />

          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: 'action.hover',
              minHeight: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: displayMode ? 'center' : 'flex-start',
              overflowX: 'auto',
            }}
          >
            {draft.trim() ? (
              <span dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <Typography variant="caption" color="text.disabled">
                Preview
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button size="small" color="inherit" startIcon={<X size={14} />} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<Check size={14} />}
              onClick={handleSave}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Popover>
    </NodeViewWrapper>
  );
};

export const MathInlineView = (props: NodeViewProps) => <MathNodeView {...props} displayMode={false} />;
export const MathBlockView = (props: NodeViewProps) => <MathNodeView {...props} displayMode={true} />;
