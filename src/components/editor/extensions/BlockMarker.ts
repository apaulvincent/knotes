import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const BlockMarker = Extension.create({
    name: 'blockMarker',

    addGlobalAttributes() {
        return [
            {
                types: [
                    'paragraph',
                    'heading',
                    'codeBlock',
                    'callout',
                    'table',
                    'taskItem'
                ],
                attributes: {
                    marked: {
                        default: null,
                        parseHTML: element => {
                            if (element.getAttribute('data-marked') === 'true' || 
                                (element.classList && element.classList.contains('marked-block'))) {
                                return true;
                            }
                            return null;
                        },
                        renderHTML: attributes => {
                            if (!attributes.marked) return {};
                            return {
                                'data-marked': 'true',
                                class: 'marked-block',
                            };
                        },
                    },
                },
            },
        ];
    },
});
