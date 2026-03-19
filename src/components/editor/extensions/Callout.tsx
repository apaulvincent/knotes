import { Node, mergeAttributes } from '@tiptap/core'

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      /**
       * Set a callout node
       */
      setCallout: (attributes?: { type: 'info' | 'warning' | 'success' | 'error' }) => ReturnType,
      /**
       * Toggle a callout node
       */
      toggleCallout: (attributes?: { type: 'info' | 'warning' | 'success' | 'error' }) => ReturnType,
    }
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: 'callout',

  group: 'block',

  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: element => element.getAttribute('data-type'),
        renderHTML: attributes => ({
          'data-type': attributes.type,
          'class': `callout callout-${attributes.type}`,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setCallout: attributes => ({ commands }) => {
        return commands.wrapIn(this.name, attributes)
      },
      toggleCallout: attributes => ({ commands }) => {
        return commands.toggleWrap(this.name, attributes)
      },
    }
  },
})
