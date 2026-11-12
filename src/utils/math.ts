import katex from 'katex';
import { Marked, RendererObject, Tokens, TokenizerAndRendererExtension } from 'marked';
import TurndownService from 'turndown';

interface MathToken extends Tokens.Generic {
  latex?: string;
  displayMode?: boolean;
}

export interface MathTextSegment {
  type: 'text' | 'math-inline' | 'math-block';
  value: string;
  raw?: string;
}

const GREEK_AND_SYMBOL_MAP: Record<string, string> = {
  '\\degree': '°',
  '\\textdegree': '°',
  '\\circ': '°',
  '\\times': '×',
  '\\cdot': '·',
  '\\pm': '±',
  '\\mp': '∓',
  '\\div': '÷',
  '\\leq': '≤',
  '\\le': '≤',
  '\\geq': '≥',
  '\\ge': '≥',
  '\\neq': '≠',
  '\\ne': '≠',
  '\\approx': '≈',
  '\\equiv': '≡',
  '\\sim': '~',
  '\\infty': '∞',
  '\\rightarrow': '→',
  '\\to': '→',
  '\\leftarrow': '←',
  '\\leftrightarrow': '↔',
  '\\Rightarrow': '⇒',
  '\\Leftarrow': '⇐',
  '\\Leftrightarrow': '⇔',
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\delta': 'δ',
  '\\epsilon': 'ε',
  '\\varepsilon': 'ε',
  '\\zeta': 'ζ',
  '\\eta': 'η',
  '\\theta': 'θ',
  '\\iota': 'ι',
  '\\kappa': 'κ',
  '\\lambda': 'λ',
  '\\mu': 'μ',
  '\\nu': 'ν',
  '\\xi': 'ξ',
  '\\pi': 'π',
  '\\rho': 'ρ',
  '\\sigma': 'σ',
  '\\tau': 'τ',
  '\\upsilon': 'υ',
  '\\phi': 'φ',
  '\\varphi': 'φ',
  '\\chi': 'χ',
  '\\psi': 'ψ',
  '\\omega': 'ω',
  '\\Delta': 'Δ',
  '\\Sigma': 'Σ',
  '\\Omega': 'Ω',
  '\\Pi': 'Π',
  '\\Theta': 'Θ',
  '\\Lambda': 'Λ',
  '\\Phi': 'Φ',
  '\\Psi': 'Ψ',
  '\\Gamma': 'Γ',
  '\\percent': '%',
  '\\%': '%',
  '\\$': '$',
  '\\&': '&',
  '\\_': '_',
  '\\#': '#',
  '\\,': ' ',
  '\\:': ' ',
  '\\;': ' ',
  '\\ ': ' ',
  '\\quad': '  ',
  '\\qquad': '    ',
};

const TEXT_WRAPPER_CMD_RE = /\\(?:text|mathrm|mathbf|textbf|textit|mathit|mathsf|mathtt|operatorname)\{([^{}]*)\}/g;

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strips one pair of outer math delimiters ($...$, $$...$$, \(...\), \[...\])
 * when the entire string represents a single delimited math expression.
 */
export function stripOuterMathDelimiters(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const segments = splitTextWithMath(trimmed);
  if (segments.length === 1 && segments[0].type !== 'text') {
    return segments[0].value;
  }
  return trimmed;
}

/**
 * Produces readable plain text for a LaTeX expression (used for note card
 * previews in the sidebar, plain-text clipboard copies, and HTML fallbacks).
 */
export function formatMathFallbackText(latex: string): string {
  if (!latex) return '';
  let result = latex.trim();

  // Normalize degree patterns before unwrapping \text{...} so ^\circ\text{C}
  // is not fused into ^\circC.
  result = result
    .replace(/\^\{\s*(?:\\circ|\\degree)\s*\}/g, '°')
    .replace(/\^\s*(?:\\circ|\\degree)(?![a-zA-Z])/g, '°')
    .replace(/(?:\\degree|\\textdegree)(?![a-zA-Z])/g, '°');

  // Replace known LaTeX symbol commands before unwrapping \text{...}
  result = result.replace(/\\[a-zA-Z]+|\\[%$&_#,;: ]/g, (token) => {
    return GREEK_AND_SYMBOL_MAP[token] ?? token;
  });

  // Unwrap \text{...}, \mathrm{...}, etc. (repeat a couple times for simple nesting)
  for (let i = 0; i < 3; i++) {
    const next = result.replace(TEXT_WRAPPER_CMD_RE, '$1');
    if (next === result) break;
    result = next;
  }

  // Simplify simple superscripts/subscripts braces
  result = result.replace(/\^\{([^{}]+)\}/g, '^$1').replace(/_\{([^{}]+)\}/g, '_$1');

  return result;
}

/**
 * Renders a LaTeX expression to static KaTeX HTML.
 */
export function renderKatexHtml(latex: string, displayMode = false): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: false,
      output: 'html',
    });
  } catch {
    return escapeHtml(latex);
  }
}

function isEscaped(text: string, index: number): boolean {
  let backslashes = 0;
  for (let i = index - 1; i >= 0 && text[i] === '\\'; i--) {
    backslashes++;
  }
  return backslashes % 2 === 1;
}

function findInlineDollarClose(text: string, openIndex: number): number {
  const afterOpen = text[openIndex + 1];
  if (!afterOpen || afterOpen === '$' || /\s/.test(afterOpen)) {
    return -1;
  }

  for (let i = openIndex + 1; i < text.length; i++) {
    const ch = text[i];
    if (ch === '\n' || ch === '\r') {
      return -1;
    }
    if (ch === '\\') {
      i++;
      continue;
    }
    if (ch === '$') {
      if (/\s/.test(text[i - 1])) {
        return -1;
      }
      const nextChar = text[i + 1];
      if (nextChar && /[0-9]/.test(nextChar)) {
        return -1;
      }
      const inner = text.slice(openIndex + 1, i);
      if (!inner || /^\d[\d,.]*\s*[-–/+,]$/.test(inner)) {
        return -1;
      }
      return i;
    }
  }

  return -1;
}

/**
 * Splits a plain text string into text, inline-math, and block-math segments
 * while protecting currency amounts ($50, $50-$100, $50 and $100) and escaped \$.
 */
export function splitTextWithMath(text: string): MathTextSegment[] {
  if (!text || (!text.includes('$') && !text.includes('\\(') && !text.includes('\\['))) {
    return text ? [{ type: 'text', value: text }] : [];
  }

  const segments: MathTextSegment[] = [];
  let cursor = 0;
  let textStart = 0;

  const pushText = (end: number) => {
    if (end > textStart) {
      const chunk = text.slice(textStart, end);
      if (segments.length > 0 && segments[segments.length - 1].type === 'text') {
        segments[segments.length - 1].value += chunk;
      } else {
        segments.push({ type: 'text', value: chunk });
      }
    }
  };

  while (cursor < text.length) {
    const ch = text[cursor];

    if (ch === '\\' && !isEscaped(text, cursor)) {
      if (text.startsWith('\\[', cursor)) {
        const closeIdx = text.indexOf('\\]', cursor + 2);
        if (closeIdx !== -1) {
          const latex = text.slice(cursor + 2, closeIdx).trim();
          if (latex) {
            pushText(cursor);
            segments.push({ type: 'math-block', value: latex, raw: text.slice(cursor, closeIdx + 2) });
            cursor = closeIdx + 2;
            textStart = cursor;
            continue;
          }
        }
      } else if (text.startsWith('\\(', cursor)) {
        const closeIdx = text.indexOf('\\)', cursor + 2);
        if (closeIdx !== -1) {
          const latex = text.slice(cursor + 2, closeIdx).trim();
          if (latex) {
            pushText(cursor);
            segments.push({ type: 'math-inline', value: latex, raw: text.slice(cursor, closeIdx + 2) });
            cursor = closeIdx + 2;
            textStart = cursor;
            continue;
          }
        }
      }
    }

    if (ch === '$' && !isEscaped(text, cursor)) {
      if (text.startsWith('$$', cursor)) {
        let closeIdx = -1;
        let searchFrom = cursor + 2;
        while (searchFrom < text.length) {
          const candidate = text.indexOf('$$', searchFrom);
          if (candidate === -1) break;
          if (!isEscaped(text, candidate)) {
            closeIdx = candidate;
            break;
          }
          searchFrom = candidate + 2;
        }
        if (closeIdx !== -1) {
          const latex = text.slice(cursor + 2, closeIdx).trim();
          if (latex) {
            pushText(cursor);
            segments.push({ type: 'math-block', value: latex, raw: text.slice(cursor, closeIdx + 2) });
            cursor = closeIdx + 2;
            textStart = cursor;
            continue;
          }
        }
        // Skip past unmatched $$ so its second $ is not treated as an inline opening $
        cursor += 2;
        continue;
      }

      const closeIdx = findInlineDollarClose(text, cursor);
      if (closeIdx !== -1) {
        const latex = text.slice(cursor + 1, closeIdx);
        pushText(cursor);
        segments.push({ type: 'math-inline', value: latex, raw: text.slice(cursor, closeIdx + 1) });
        cursor = closeIdx + 1;
        textStart = cursor;
        continue;
      }
    }

    cursor++;
  }

  pushText(text.length);
  return segments;
}

export function findTrailingMathMatch(
  text: string,
  target: 'inline' | 'block'
): { index: number; raw: string; latex: string } | null {
  if (!text) return null;
  const segments = splitTextWithMath(text);
  if (segments.length === 0) return null;

  const last = segments[segments.length - 1];
  if (last.type === 'text' || !last.raw) return null;

  if (target === 'block') {
    if (last.type !== 'math-block') return null;
    const onlyWhitespaceBefore = segments
      .slice(0, -1)
      .every((s) => s.type === 'text' && !s.value.trim());
    if (!onlyWhitespaceBefore) return null;
    return { index: 0, raw: text, latex: last.value };
  }

  // Inline target: match math-inline, or math-block when preceded by other content in the same line
  if (last.type === 'math-block') {
    const onlyWhitespaceBefore = segments
      .slice(0, -1)
      .every((s) => s.type === 'text' && !s.value.trim());
    if (onlyWhitespaceBefore) return null;
  }

  return {
    index: text.length - last.raw.length,
    raw: last.raw,
    latex: last.value,
  };
}

function createMathSpanElement(doc: Document, latex: string): HTMLSpanElement {
  const span = doc.createElement('span');
  span.setAttribute('data-type', 'math-inline');
  span.setAttribute('data-latex', latex);
  span.className = 'katex-math-inline';
  span.textContent = formatMathFallbackText(latex) || latex;
  return span;
}

function createMathDivElement(doc: Document, latex: string): HTMLDivElement {
  const div = doc.createElement('div');
  div.setAttribute('data-type', 'math-block');
  div.setAttribute('data-latex', latex);
  div.className = 'katex-math-block';
  div.textContent = formatMathFallbackText(latex) || latex;
  return div;
}

/**
 * Normalizes math inside HTML (from Firestore notes, clipboard HTML pastes from
 * Gemini/ChatGPT/KaTeX, or markdown output) into TipTap math-inline / math-block nodes.
 * Returns the original string unchanged when no math conversions are needed.
 */
export function preprocessHtmlMath(html: string): string {
  if (!html || typeof html !== 'string') return html;

  const mightHaveMath =
    html.includes('$') ||
    html.includes('\\(') ||
    html.includes('\\[') ||
    html.includes('katex') ||
    html.includes('data-math') ||
    html.includes('math-inline') ||
    html.includes('math-block') ||
    html.includes('math/tex');

  if (!mightHaveMath || typeof DOMParser === 'undefined') {
    return html;
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');
  let changed = false;

  // 1. Convert pasted rendered KaTeX / Gemini [data-math] / MathJax containers
  const mathContainers = Array.from(
    doc.body.querySelectorAll(
      '.katex-display, .katex, [data-math], math-inline, math-block, script[type^="math/tex"]'
    )
  );

  for (const el of mathContainers) {
    if (!el.isConnected) continue;
    if (el.closest('code, pre, [data-type="math-inline"], [data-type="math-block"]')) continue;

    const isBlock =
      el.classList.contains('katex-display') ||
      el.classList.contains('math-block') ||
      el.tagName === 'MATH-BLOCK' ||
      (el.tagName === 'SCRIPT' && (el.getAttribute('type') || '').includes('mode=display'));

    let rawLatex =
      el.getAttribute('data-math') ||
      el.getAttribute('data-latex') ||
      el.querySelector('annotation[encoding="application/x-tex"]')?.textContent ||
      (el.tagName === 'SCRIPT' ? el.textContent : null);

    if (!rawLatex && (el.tagName === 'MATH-INLINE' || el.tagName === 'MATH-BLOCK')) {
      const candidate = el.textContent?.trim() || '';
      const parsed = splitTextWithMath(candidate);
      if (parsed.length === 1 && parsed[0].type !== 'text') {
        rawLatex = parsed[0].value;
      }
    }

    if (!rawLatex || !rawLatex.trim()) continue;
    const latex = stripOuterMathDelimiters(rawLatex);
    if (!latex) continue;

    const replacement = isBlock
      ? createMathDivElement(doc, latex)
      : createMathSpanElement(doc, latex);
    el.replaceWith(replacement);
    changed = true;
  }

  // 2. Convert remaining raw text delimiters ($...$, $$...$$, \(...\), \[...\])
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let currentNode = walker.nextNode();
  while (currentNode) {
    const parentEl = currentNode.parentElement;
    if (
      parentEl &&
      !parentEl.closest(
        'code, pre, script, style, textarea, a, [data-type="math-inline"], [data-type="math-block"]'
      )
    ) {
      const value = currentNode.nodeValue || '';
      if (value.includes('$') || value.includes('\\(') || value.includes('\\[')) {
        textNodes.push(currentNode as Text);
      }
    }
    currentNode = walker.nextNode();
  }

  for (const textNode of textNodes) {
    const raw = textNode.nodeValue || '';
    const segments = splitTextWithMath(raw);
    if (segments.every((seg) => seg.type === 'text')) {
      continue;
    }

    changed = true;

    // If a <p> (not inside <li>) only contains a single block-math expression, promote the whole <p> to math-block
    const parent = textNode.parentElement;
    if (
      parent &&
      parent.tagName === 'P' &&
      parent.parentElement?.tagName !== 'LI' &&
      parent.childNodes.length === 1 &&
      segments.every((seg) => seg.type === 'math-block' || !seg.value.trim())
    ) {
      const blockSeg = segments.find((seg) => seg.type === 'math-block');
      if (blockSeg) {
        parent.replaceWith(createMathDivElement(doc, blockSeg.value));
        continue;
      }
    }

    const fragment = doc.createDocumentFragment();
    for (const seg of segments) {
      if (seg.type === 'text') {
        fragment.appendChild(doc.createTextNode(seg.value));
      } else {
        fragment.appendChild(createMathSpanElement(doc, seg.value));
      }
    }
    textNode.replaceWith(fragment);
  }

  return changed ? doc.body.innerHTML : html;
}

/**
 * Normalizes markdown text from LLMs without mangling LaTeX commands like \text,
 * \times, \neq, or \rightarrow into literal tab/newline characters.
 */
export function normalizeMarkdownSafe(text: string): string {
  if (!text || typeof text !== 'string') return '';

  const segments = splitTextWithMath(text);
  let rebuilt = segments
    .map((seg) => {
      if (seg.type !== 'text') {
        return seg.raw ?? (seg.type === 'math-block' ? `$$${seg.value}$$` : `$${seg.value}$`);
      }
      let chunk = seg.value;
      if (chunk.includes('\\n') || chunk.includes('\\r')) {
        chunk = chunk.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\r/g, '\n');
      }
      if (chunk.includes('\\t')) {
        chunk = chunk.replace(/\\t/g, '\t');
      }
      return chunk;
    })
    .join('');

  rebuilt = rebuilt.replace(/^```markdown\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  return rebuilt;
}

function createMathMarkedInstance(mode: 'tiptap' | 'katex', options?: { breaks?: boolean; gfm?: boolean }): Marked {
  const instance = new Marked({
    gfm: options?.gfm ?? true,
    breaks: options?.breaks ?? false,
  });

  const blockMathExtension: TokenizerAndRendererExtension = {
    name: 'blockMath',
    level: 'block',
    start(src: string) {
      const match = src.match(/(?:^|\n)[ \t]*(\$\$|\\\[)/);
      if (!match || match.index === undefined) return undefined;
      return match.index + (match[0].startsWith('\n') ? 1 : 0);
    },
    tokenizer(src: string) {
      const match = src.match(/^[ \t]*(?:\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\])[ \t]*(?=\r?\n|$)/);
      if (match) {
        const latex = (match[1] ?? match[2] ?? '').trim();
        if (latex) {
          return {
            type: 'blockMath',
            raw: match[0],
            latex,
          };
        }
      }
      return undefined;
    },
    renderer(token) {
      const latex = String((token as MathToken).latex || '');
      if (mode === 'katex') {
        return `<div class="katex-math-block">${renderKatexHtml(latex, true)}</div>\n`;
      }
      const fallback = escapeHtml(formatMathFallbackText(latex) || latex);
      return `<div data-type="math-block" data-latex="${escapeHtml(latex)}" class="katex-math-block">${fallback}</div>\n`;
    },
  };

  const inlineMathExtension: TokenizerAndRendererExtension = {
    name: 'inlineMath',
    level: 'inline',
    start(src: string) {
      const idx = src.search(/\$|\\\(/);
      return idx === -1 ? undefined : idx;
    },
    tokenizer(src: string) {
      if (src.startsWith('\\(')) {
        const closeIdx = src.indexOf('\\)', 2);
        if (closeIdx !== -1) {
          const latex = src.slice(2, closeIdx).trim();
          if (latex) {
            return {
              type: 'inlineMath',
              raw: src.slice(0, closeIdx + 2),
              latex,
              displayMode: false,
            };
          }
        }
        return undefined;
      }

      if (src.startsWith('$$')) {
        let searchFrom = 2;
        while (searchFrom < src.length) {
          const closeIdx = src.indexOf('$$', searchFrom);
          if (closeIdx === -1) break;
          if (!isEscaped(src, closeIdx)) {
            const latex = src.slice(2, closeIdx).trim();
            if (latex) {
              return {
                type: 'inlineMath',
                raw: src.slice(0, closeIdx + 2),
                latex,
                displayMode: true,
              };
            }
            break;
          }
          searchFrom = closeIdx + 2;
        }
        return undefined;
      }

      if (src.startsWith('$')) {
        const closeIdx = findInlineDollarClose(src, 0);
        if (closeIdx !== -1) {
          const latex = src.slice(1, closeIdx);
          return {
            type: 'inlineMath',
            raw: src.slice(0, closeIdx + 1),
            latex,
            displayMode: false,
          };
        }
      }

      return undefined;
    },
    renderer(token) {
      const mathToken = token as MathToken;
      const latex = String(mathToken.latex || '');
      const displayMode = Boolean(mathToken.displayMode);
      if (mode === 'katex') {
        return `<span class="katex-math-inline">${renderKatexHtml(latex, displayMode)}</span>`;
      }
      const fallback = escapeHtml(formatMathFallbackText(latex) || latex);
      return `<span data-type="math-inline" data-latex="${escapeHtml(latex)}" class="katex-math-inline">${fallback}</span>`;
    },
  };

  // Prevent marked from stripping backslash inside escaped math like \$ when needed; default renderer handles others
  const renderer: RendererObject = {};
  instance.use({ extensions: [blockMathExtension, inlineMathExtension], renderer });
  return instance;
}

const markedTiptapDefault = createMathMarkedInstance('tiptap', { gfm: true, breaks: false });
const markedKatexDefault = createMathMarkedInstance('katex', { gfm: true, breaks: false });
const markedKatexBreaks = createMathMarkedInstance('katex', { gfm: true, breaks: true });

export function parseMarkdownWithMath(
  markdown: string,
  options: { mode: 'tiptap' | 'katex'; breaks?: boolean }
): string {
  if (!markdown || markdown.trim() === '') return '';
  if (options.mode === 'tiptap') {
    return markedTiptapDefault.parse(markdown) as string;
  }
  const instance = options.breaks ? markedKatexBreaks : markedKatexDefault;
  return instance.parse(markdown) as string;
}

export function createMathTurndownService(): TurndownService {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });

  turndown.addRule('mathInline', {
    filter: (node) =>
      node.nodeName === 'SPAN' && (node as HTMLElement).getAttribute('data-type') === 'math-inline',
    replacement: (_content, node) => {
      const latex = (node as HTMLElement).getAttribute('data-latex') || '';
      return latex ? `$${latex}$` : '';
    },
  });

  turndown.addRule('mathBlock', {
    filter: (node) =>
      node.nodeName === 'DIV' && (node as HTMLElement).getAttribute('data-type') === 'math-block',
    replacement: (_content, node) => {
      const latex = (node as HTMLElement).getAttribute('data-latex') || '';
      return latex ? `\n\n$$\n${latex}\n$$\n\n` : '';
    },
  });

  return turndown;
}

const sharedTurndown = createMathTurndownService();

export function convertHtmlToMarkdownWithMath(html: string): string {
  if (!html || html.trim() === '') return '';
  const normalizedHtml = preprocessHtmlMath(html);
  return sharedTurndown.turndown(normalizedHtml);
}

/**
 * Produces plain preview text from note HTML (converting both stored math nodes
 * and legacy raw $...$ text into human-readable characters like 55 °C).
 */
export function getPlainPreviewText(html: string, maxLength = 250): string {
  if (!html) return '';
  const stripped = html.replace(/<[^>]*>/g, '');
  const segments = splitTextWithMath(stripped);
  const readable = segments
    .map((seg) => (seg.type === 'text' ? seg.value : formatMathFallbackText(seg.value) || seg.value))
    .join('');
  return readable.substring(0, maxLength);
}
