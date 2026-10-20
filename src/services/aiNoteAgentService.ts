// src/services/aiNoteAgentService.ts
import { marked } from 'marked';
import TurndownService from 'turndown';

export interface ActionProposal {
  action: 'FORMAT' | 'POLISH' | 'CHECKLIST' | 'SUMMARIZE' | 'CONCISE' | 'TABLE' | 'EXPAND' | 'CUSTOM' | 'CHAT';
  summary: string;
  originalContent: string;
  formattedContent: string;
  formattedHtml: string;
  updatedTitle?: string | null;
}

export interface NoteAgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
  engine?: string;
  proposal?: ActionProposal | null;
  rateLimited?: boolean;
  retryAfter?: number;
}

export interface SendMessageOptions {
  messages: NoteAgentMessage[];
  noteTitle: string;
  noteContent: string;
  actionType?: 'FORMAT' | 'POLISH' | 'CHECKLIST' | 'SUMMARIZE' | 'CONCISE' | 'TABLE' | 'EXPAND' | 'CUSTOM';
  customPrompt?: string;
}

const DEFAULT_API_KEY =
  import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY ||
  'AIzaSyAzVEBzOSzBF_iCJ20_zJ8AygLzdZru2mo';

export class AiNoteAgentService {
  private customApiKey: string | null = null;
  private turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });

  constructor() {
    if (typeof window !== 'undefined') {
      this.customApiKey = localStorage.getItem('knotes_gemini_api_key');
    }
  }

  getApiKey(): string {
    if (this.customApiKey && this.customApiKey.trim().length > 0) {
      return this.customApiKey.trim();
    }
    const envKey = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY;
    if (envKey && typeof envKey === 'string' && envKey.trim().length > 0) {
      return envKey.trim();
    }
    return DEFAULT_API_KEY;
  }

  setCustomApiKey(key: string | null) {
    this.customApiKey = key;
    if (typeof window !== 'undefined') {
      if (key) {
        localStorage.setItem('knotes_gemini_api_key', key.trim());
      } else {
        localStorage.removeItem('knotes_gemini_api_key');
      }
    }
  }

  getActiveEngineName(): string {
    return 'Gemini 3.8 Flash';
  }

  /**
   * Converts HTML note content to clean markdown for the LLM
   */
  convertHtmlToMarkdown(html: string): string {
    if (!html || html.trim() === '') return '';
    try {
      return this.turndown.turndown(html);
    } catch {
      return html.replace(/<[^>]*>/g, '');
    }
  }

  /**
   * Converts markdown to Tiptap-friendly HTML with support for
   * task lists, tables, code blocks, and callouts
   */
  convertMarkdownToTiptapHtml(markdown: string): string {
    if (!markdown || markdown.trim() === '') return '';

    try {
      let html = marked.parse(markdown) as string;

      // Transform task list items: <li><input type="checkbox"...> text</li> into Tiptap task items
      html = html.replace(
        /<ul>\s*((?:<li><input[^>]*type=["']checkbox["'][^>]*>[\s\S]*?<\/li>\s*)+)<\/ul>/gi,
        (_match, items) => {
          const transformedItems = items.replace(
            /<li><input([^>]*)type=["']checkbox["']([^>]*)>([\s\S]*?)<\/li>/gi,
            (_m: string, b1: string, b2: string, text: string) => {
              const isChecked = (b1 + b2).toLowerCase().includes('checked');
              const cleanText = text.trim();
              return `<li data-type="taskItem" data-checked="${isChecked}"><label><input type="checkbox"${
                isChecked ? ' checked' : ''
              }><span></span></label><div><p>${cleanText}</p></div></li>`;
            }
          );
          return `<ul data-type="taskList">${transformedItems}</ul>`;
        }
      );

      // Transform markdown callout blockquotes: > [!NOTE] content into Tiptap callout nodes
      html = html.replace(
        /<blockquote>\s*<p>\[!(NOTE|INFO|TIP|WARNING|CAUTION|IMPORTANT)\]\s*([\s\S]*?)<\/p>\s*<\/blockquote>/gi,
        (_match, type, content) => {
          const lower = type.toUpperCase();
          const calloutType =
            lower === 'WARNING' || lower === 'CAUTION'
              ? 'warning'
              : lower === 'IMPORTANT'
              ? 'error'
              : 'info';
          return `<div data-type="${calloutType}" class="callout callout-${calloutType}"><p>${content.trim()}</p></div>`;
        }
      );

      return html;
    } catch (err) {
      console.error('Failed to parse markdown to HTML:', err);
      return `<p>${markdown}</p>`;
    }
  }

  /**
   * Main messaging method to send instructions or prompts to the Gemini note agent
   */
  async sendMessage(options: SendMessageOptions): Promise<NoteAgentMessage> {
    const { messages, noteTitle, noteContent, actionType, customPrompt } = options;
    const apiKey = this.getApiKey();

    const noteMarkdown = this.convertHtmlToMarkdown(noteContent);

    // Build the system prompt
    const systemPrompt = `You are KNotes AI Copilot, a high-end personal note-taking assistant and editor embedded directly in the KNotes canvas.
Your role is to help the user edit, format, polish, structure, summarize, and organize their current note.

CRITICAL EDITORIAL & WRITING GUIDELINES:
1. HUMANIZED PROSE: Write naturally and plainly. Avoid stock AI clichés (delve, testament, tapestry, landscape, crucial, pivotal, multifaceted, vibrant, fostering). Do not use forced triads or staged run-ups like "Let's dive in" or "Here's the thing". Keep your voice direct, helpful, and human.
2. PRESERVE INTENT & FACTS: When formatting or editing notes, never delete or distort the user's factual claims, names, dates, links, or technical details unless explicitly instructed.
3. OUTPUT FORMAT & TIPTAP COMPATIBILITY:
   When editing or formatting notes, generate standard, clean Markdown:
   - Use headings (# ## ###) for clear visual structure.
   - Use checklists with \`- [ ]\` and \`- [x]\` for actionable items or to-dos.
   - Use standard Markdown tables (\`| Col 1 | Col 2 |\`) for comparisons or organized data.
   - Use code blocks with language identifiers (\`\`\`ts, \`\`\`json, \`\`\`sql) for technical notes.
   - Use blockquotes (\`> [!NOTE]\` or \`> [!WARNING]\`) for key takeaways or caveats.
4. ACTION INTENT:
   If the user asks to edit, reformat, summarize, clean up, or change the note:
   - Provide the complete new formatted note in \`formattedContent\` (in Markdown).
   - Provide a concise 1-2 sentence description in \`summary\` of what was changed.
   - Provide a friendly, brief conversational response in \`reply\`.
   - If a title improvement is helpful or requested, provide \`updatedTitle\`; otherwise keep it null.
   If the user is only asking a conversational question about the note (e.g. "What deadline is mentioned here?" or "Give me ideas for section 2"):
   - Put the answer in \`reply\`.
   - Leave \`formattedContent\` as null.

RESPONSE JSON SCHEMA:
You MUST respond with valid JSON adhering to this exact structure:
{
  "summary": "Short 1-2 sentence overview of improvements made",
  "reply": "Friendly concise answer or explanation to the user",
  "updatedTitle": "Optional improved title or null if title should remain unchanged",
  "formattedContent": "Full updated note content in clean Markdown, or null if only answering a question",
  "action": "FORMAT" | "POLISH" | "CHECKLIST" | "SUMMARIZE" | "CONCISE" | "TABLE" | "EXPAND" | "CUSTOM" | "CHAT"
}`;

    const contextPrefix = `CURRENT NOTE CONTEXT:
Title: ${noteTitle || 'Untitled Note'}
Current Content (Markdown representation):
"""
${noteMarkdown || '(Empty Note)'}
"""

`;

    let instructionText = customPrompt || '';
    if (actionType) {
      switch (actionType) {
        case 'FORMAT':
          instructionText =
            'Format and structure this note cleanly with clear hierarchy, headings, readable bullet points, and organized sections.';
          break;
        case 'POLISH':
          instructionText =
            'Polish grammar, spelling, punctuation, and flow throughout the note while preserving all facts and natural voice.';
          break;
        case 'CHECKLIST':
          instructionText =
            'Extract all action items, tasks, and to-dos into a structured checklist with - [ ] checkboxes.';
          break;
        case 'SUMMARIZE':
          instructionText =
            'Generate a concise Executive Summary and Key Takeaways section at the top of the note followed by the organized details.';
          break;
        case 'CONCISE':
          instructionText =
            'Tighten this note to be concise and direct. Cut unnecessary wordiness without losing any factual information.';
          break;
        case 'TABLE':
          instructionText =
            'Organize the data, items, or comparisons in this note into a clean, well-formatted Markdown table.';
          break;
        case 'EXPAND':
          instructionText =
            'Elaborate on the key points in this note with practical next steps, detailed subsections, and helpful context.';
          break;
      }
    }

    // Build chat history for Gemini
    const contents: any[] = [];

    // System prompt included as first developer instruction
    const userPromptWithContext = `${contextPrefix}User Request: ${instructionText}`;

    // Include recent message history
    const history = messages.slice(-8).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    if (history.length > 0) {
      contents.push(...history);
      contents.push({
        role: 'user',
        parts: [{ text: userPromptWithContext }],
      });
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\n${userPromptWithContext}` }],
      });
    }

    const candidateModels = ['gemini-3.8-flash', 'gemini-2.5-flash'];
    let responseData: any = null;
    let activeModelName = 'gemini-3.8-flash';
    let lastError: any = null;

    try {
      for (const model of candidateModels) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              systemInstruction: {
                parts: [{ text: systemPrompt }],
              },
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.3,
                maxOutputTokens: 8192,
              },
            }),
          });

          if (response.status === 429) {
            return {
              id: 'msg-' + Date.now(),
              role: 'assistant',
              content: 'You have reached the API rate limit. Please wait a moment before sending another request.',
              rateLimited: true,
              retryAfter: 30,
              createdAt: new Date(),
            };
          }

          if (response.status === 404) {
            // Deprecated on this key/region, fall back to next model
            continue;
          }

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Gemini API error on ${model}:`, response.status, errorText);
            throw new Error(`Gemini API error ${response.status}: ${errorText}`);
          }

          responseData = await response.json();
          activeModelName = model;
          break;
        } catch (err: any) {
          lastError = err;
        }
      }

      if (!responseData) {
        throw lastError || new Error('No available Gemini model responded');
      }

      const parts = responseData?.candidates?.[0]?.content?.parts || [];
      const textPart = parts.find((p: any) => typeof p.text === 'string' && !p.thought) || parts[0];
      const rawText = textPart?.text;

      if (!rawText) {
        throw new Error('No response text received from Gemini');
      }

      let parsed: any;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        // Fallback if not valid JSON
        parsed = {
          reply: rawText,
          summary: 'Generated response',
          formattedContent: null,
          action: 'CHAT',
        };
      }

      let proposal: ActionProposal | null = null;
      if (parsed.formattedContent && typeof parsed.formattedContent === 'string' && parsed.formattedContent.trim().length > 0) {
        const formattedHtml = this.convertMarkdownToTiptapHtml(parsed.formattedContent);
        proposal = {
          action: parsed.action || actionType || 'CUSTOM',
          summary: parsed.summary || 'Formatted note updates',
          originalContent: noteContent,
          formattedContent: parsed.formattedContent,
          formattedHtml,
          updatedTitle: parsed.updatedTitle || null,
        };
      }

      return {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        content: parsed.reply || parsed.summary || 'I have analyzed and formatted your note.',
        createdAt: new Date(),
        engine: activeModelName === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Gemini Flash',
        proposal,
      };
    } catch (err: any) {
      console.error('Note Agent send error:', err);
      return {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        content: `I ran into an issue connecting to the AI service: ${err?.message || 'Network error'}. Please check your connection or API key.`,
        createdAt: new Date(),
      };
    }
  }
}

export const aiNoteAgentService = new AiNoteAgentService();
