import { InputRule, Node, mergeAttributes } from '@tiptap/core';
import { Fragment, Node as PMNode, Slice } from '@tiptap/pm/model';
import { EditorView } from '@tiptap/pm/view';
import { ReactNodeViewRenderer } from '@tiptap/react';
import {
  findTrailingMathMatch,
  formatMathFallbackText,
  splitTextWithMath,
} from '../../../utils/math';
import { MathBlockView, MathInlineView } from './MathNodeView';

export const MathInline = Node.create({
  name: 'mathInline',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex') || element.textContent || '',
        renderHTML: (attributes) => ({
          'data-latex': attributes.latex,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="math-inline"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const latex = (node.attrs.latex as string) || '';
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'math-inline',
        class: 'katex-math-inline',
      }),
      formatMathFallbackText(latex) || latex,
    ];
  },

  renderText({ node }) {
    const latex = (node.attrs.latex as string) || '';
    return formatMathFallbackText(latex) || latex;
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathInlineView);
  },

  addInputRules() {
    return [
      new InputRule({
        find: (text) => {
          const matched = findTrailingMathMatch(text, 'inline');
          if (!matched) return null;
          return {
            index: matched.index,
            text: matched.raw,
            data: { latex: matched.latex },
          };
        },
        handler: ({ state, range, match }) => {
          const latex = typeof match.data?.latex === 'string' ? match.data.latex : undefined;
          if (!latex) return null;
          if (state.doc.rangeHasMark(range.from, range.to, state.schema.marks.code)) {
            return null;
          }
          state.tr.replaceWith(range.from, range.to, this.type.create({ latex }));
        },
      }),
    ];
  },
});

export const MathBlock = Node.create({
  name: 'mathBlock',
  group: 'block',
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex') || element.textContent || '',
        renderHTML: (attributes) => ({
          'data-latex': attributes.latex,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="math-block"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const latex = (node.attrs.latex as string) || '';
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'math-block',
        class: 'katex-math-block',
      }),
      formatMathFallbackText(latex) || latex,
    ];
  },

  renderText({ node }) {
    const latex = (node.attrs.latex as string) || '';
    return formatMathFallbackText(latex) || latex;
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathBlockView);
  },

  addInputRules() {
    return [
      new InputRule({
        find: (text) => {
          const matched = findTrailingMathMatch(text, 'block');
          if (!matched) return null;
          return {
            index: matched.index,
            text: matched.raw,
            data: { latex: matched.latex },
          };
        },
        handler: ({ state, range, match }) => {
          const latex = typeof match.data?.latex === 'string' ? match.data.latex : undefined;
          if (!latex) return null;

          const $from = state.doc.resolve(range.from);
          const parentDepth = $from.depth;
          if (parentDepth >= 1 && $from.parent.type.name === 'paragraph') {
            const grandParent = $from.node(parentDepth - 1);
            const idx = $from.index(parentDepth - 1);
            if (grandParent.canReplaceWith(idx, idx + 1, this.type)) {
              state.tr.replaceWith(
                $from.before(parentDepth),
                $from.after(parentDepth),
                this.type.create({ latex })
              );
              return;
            }
          }

          const mathInline = state.schema.nodes.mathInline;
          if (mathInline) {
            state.tr.replaceWith(range.from, range.to, mathInline.create({ latex }));
          }
        },
      }),
    ];
  },
});

function transformFragmentForMath(
  fragment: Fragment,
  view: EditorView,
  plain: boolean,
  allowBlockPromotion = true
): { fragment: Fragment; changed: boolean } {
  const { mathInline, mathBlock } = view.state.schema.nodes;
  if (!mathInline && !mathBlock) {
    return { fragment, changed: false };
  }

  let nodes: PMNode[] = [];
  let changed = false;

  // Merge multi-line $$ ... $$ or \[ ... \] fences on plain-text pastes
  const rawChildren: PMNode[] = [];
  fragment.forEach((child) => rawChildren.push(child));

  if (plain && allowBlockPromotion && mathBlock) {
    for (let i = 0; i < rawChildren.length; i++) {
      const child = rawChildren[i];
      const trimmed = child.type.name === 'paragraph' ? child.textContent.trim() : '';
      if (trimmed === '$$' || trimmed === '\\[') {
        const closingMarker = trimmed === '$$' ? '$$' : '\\]';
        let closeIdx = -1;
        for (let j = i + 1; j < rawChildren.length; j++) {
          if (
            rawChildren[j].type.name === 'paragraph' &&
            rawChildren[j].textContent.trim() === closingMarker
          ) {
            closeIdx = j;
            break;
          }
        }
        if (closeIdx > i + 1) {
          const latex = rawChildren
            .slice(i + 1, closeIdx)
            .map((n) => n.textContent)
            .join('\n')
            .trim();
          if (latex) {
            nodes.push(mathBlock.create({ latex }));
            i = closeIdx;
            changed = true;
            continue;
          }
        }
      }
      nodes.push(child);
    }
  } else {
    nodes = rawChildren;
  }

  const transformedNodes: PMNode[] = [];

  for (const child of nodes) {
    if (child.type.spec.code || child.type === mathInline || child.type === mathBlock) {
      transformedNodes.push(child);
      continue;
    }

    if (child.isText) {
      if (child.marks.some((m) => m.type.spec.code)) {
        transformedNodes.push(child);
        continue;
      }
      const text = child.text || '';
      const segments = splitTextWithMath(text);
      if (segments.every((s) => s.type === 'text')) {
        transformedNodes.push(child);
        continue;
      }

      changed = true;
      for (const seg of segments) {
        if (seg.type === 'text') {
          if (seg.value) {
            transformedNodes.push(view.state.schema.text(seg.value, child.marks));
          }
        } else if (mathInline) {
          transformedNodes.push(mathInline.create({ latex: seg.value }));
        }
      }
      continue;
    }

    if (child.content.size > 0) {
      // Check if a top-level paragraph holds only a single block-math expression (e.g. $$E=mc^2$$)
      if (
        allowBlockPromotion &&
        child.type.name === 'paragraph' &&
        mathBlock &&
        child.childCount === 1 &&
        child.firstChild?.isText &&
        !child.firstChild.marks.some((m) => m.type.spec.code)
      ) {
        const segments = splitTextWithMath(child.firstChild.text || '');
        const nonEmpty = segments.filter((s) => s.type !== 'text' || s.value.trim().length > 0);
        if (nonEmpty.length === 1 && nonEmpty[0].type === 'math-block') {
          transformedNodes.push(mathBlock.create({ latex: nonEmpty[0].value }));
          changed = true;
          continue;
        }
      }

      const canPromoteChildren = child.type.name === 'blockquote' || child.type.name === 'callout';
      const inner = transformFragmentForMath(child.content, view, false, canPromoteChildren);
      if (inner.changed) {
        changed = true;
        transformedNodes.push(child.copy(inner.fragment));
      } else {
        transformedNodes.push(child);
      }
    } else {
      transformedNodes.push(child);
    }
  }

  if (!changed) {
    return { fragment, changed: false };
  }

  return {
    fragment: Fragment.fromArray(transformedNodes),
    changed: true,
  };
}

/**
 * ProseMirror transformPasted hook that converts raw LaTeX delimiters in pasted
 * plain text or HTML slices into MathInline / MathBlock nodes outside code blocks.
 */
export function transformPastedMathSlice(slice: Slice, view: EditorView, plain: boolean): Slice {
  if (!slice || slice.size === 0) return slice;

  const { $from } = view.state.selection;
  if ($from.parent.type.spec.code || $from.marks().some((m) => m.type.spec.code)) {
    return slice;
  }

  const { fragment, changed } = transformFragmentForMath(slice.content, view, plain);
  if (!changed) return slice;

  let openStart = slice.openStart;
  let openEnd = slice.openEnd;
  if (openStart > 0 && fragment.firstChild?.isAtom) {
    openStart = 0;
  }
  if (openEnd > 0 && fragment.lastChild?.isAtom) {
    openEnd = 0;
  }

  return new Slice(fragment, openStart, openEnd);
}
