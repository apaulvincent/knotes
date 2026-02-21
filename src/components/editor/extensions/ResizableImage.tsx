import { NodeViewWrapper, NodeViewProps, ReactNodeViewRenderer } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import { Box, IconButton } from '@mui/material';
import { Maximize2 } from 'lucide-react';
import React, { useState } from 'react';

const ResizableImageNode = (props: NodeViewProps) => {
    const { node, updateAttributes, selected } = props;
    const [resizing, setResizing] = useState(false);
    const [width, setWidth] = useState(node.attrs.width || 'auto');

    const widthRef = React.useRef(node.attrs.width || 'auto');

    const onMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setResizing(true);

        const startX = e.clientX;
        const startWidth = parseInt(String(widthRef.current)) || (e.target as HTMLElement).parentElement?.querySelector('img')?.clientWidth || 300;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const currentWidth = startWidth + (moveEvent.clientX - startX);
            setWidth(currentWidth);
            widthRef.current = currentWidth;
        };

        const onMouseUp = () => {
            setResizing(false);
            updateAttributes({ width: widthRef.current });
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    // This is for the "Full screen" button
    const openFullScreen = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Dispatches a custom event that the editor can listen to
        const event = new CustomEvent('open-image-modal', {
            detail: { src: node.attrs.src },
            bubbles: true
        });
        document.dispatchEvent(event);
    };

    return (
        <NodeViewWrapper className="resizable-image-wrapper">
            <Box
                sx={{
                    position: 'relative',
                    display: 'inline-block',
                    lineHeight: 0,
                    outline: selected ? '2px solid #6366f1' : 'none',
                    borderRadius: '4px',
                    transition: 'outline 0.1s',
                    '&:hover .image-controls': {
                        opacity: 1
                    }
                }}
            >
                <img
                    src={node.attrs.src}
                    alt={node.attrs.alt}
                    style={{
                        width: resizing ? width : node.attrs.width || 'auto',
                        height: 'auto',
                        display: 'block',
                        borderRadius: '4px',
                        maxWidth: '100%'
                    }}
                />

                {/* Full Screen Button */}
                <Box
                    className="image-controls"
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        zIndex: 10,
                        display: 'flex',
                        gap: 1
                    }}
                >
                    <IconButton
                        size="small"
                        onClick={openFullScreen}
                        sx={{
                            bgcolor: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                        }}
                    >
                        <Maximize2 size={16} />
                    </IconButton>
                </Box>

                {/* Resize Handle */}
                {selected && (
                    <Box
                        onMouseDown={onMouseDown}
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 12,
                            height: 12,
                            bgcolor: '#6366f1',
                            cursor: 'nwse-resize',
                            borderTopLeftRadius: '4px',
                            zIndex: 11
                        }}
                    />
                )}
            </Box>
        </NodeViewWrapper>
    );
};

export const ResizableImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: 'auto',
                renderHTML: (attributes: Record<string, any>) => ({
                    width: attributes.width,
                }),
            },
            height: {
                default: 'auto',
                renderHTML: (attributes: Record<string, any>) => ({
                    height: attributes.height,
                }),
            },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageNode);
    },
});
