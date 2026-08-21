import { Extension } from '@tiptap/core';

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
