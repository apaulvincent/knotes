import { Box, IconButton, MenuItem, Select, SelectChangeEvent, Tooltip } from '@mui/material';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { NodeViewContent, NodeViewProps, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

const CodeBlockEnhancedNode = (props: NodeViewProps) => {
    const { node: { attrs: { language: defaultLanguage } }, updateAttributes } = props;
    const [copied, setCopied] = useState(false);

    const languages = [
        { label: 'JavaScript', value: 'javascript' },
        { label: 'Markdown', value: 'markdown' },
        { label: 'JSON', value: 'json' },
        { label: 'PHP', value: 'php' },
        { label: 'HTML', value: 'html' },
        { label: 'CSS', value: 'css' },
        { label: 'TypeScript', value: 'typescript' },
        { label: 'Python', value: 'python' },
    ];

    // Filter to only the requested languages for the selector, but allow others if already set
    const allowedValues = ['javascript', 'markdown', 'json', 'php'];
    const displayLanguages = languages.filter(lang => allowedValues.includes(lang.value));

    const handleCopy = () => {
        const text = props.node.textContent;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLanguageChange = (event: SelectChangeEvent) => {
        updateAttributes({ language: event.target.value });
    };

    return (
        <NodeViewWrapper className="code-block-enhanced" style={{ position: 'relative' }}>
            <Box
                className="code-block-header"
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    zIndex: 10,
                    opacity: 0.6,
                    transition: 'opacity 0.2s',
                    '&:hover': {
                        opacity: 1
                    },
                    // Ensure header doesn't interfere with text selection if it's too large, 
                    // though here it's small and in the corner.
                }}
            >
                <Select
                    value={defaultLanguage || 'javascript'}
                    onChange={handleLanguageChange}
                    size="small"
                    variant="standard"
                    disableUnderline
                    sx={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        px: 1,
                        borderRadius: '4px',
                        '& .MuiSelect-select': {
                            py: 0.5,
                            pr: '24px !important',
                        },
                        '& .MuiSvgIcon-root': {
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontSize: '1rem',
                        },
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        }
                    }}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                bgcolor: '#1e293b',
                                color: 'white',
                                '& .MuiMenuItem-root:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                },
                            }
                        }
                    }}
                >
                    {displayLanguages.map((lang) => (
                        <MenuItem key={lang.value} value={lang.value} sx={{ fontSize: '0.875rem' }}>
                            {lang.label}
                        </MenuItem>
                    ))}
                </Select>

                <Tooltip title={copied ? "Copied!" : "Copy Code"}>
                    <IconButton
                        size="small"
                        onClick={handleCopy}
                        sx={{
                            color: copied ? '#4ade80' : 'rgba(255, 255, 255, 0.7)',
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                color: 'white'
                            }
                        }}
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                    </IconButton>
                </Tooltip>
            </Box>
            <pre>
                <NodeViewContent as={'code' as any} />
            </pre>
        </NodeViewWrapper>
    );
};

export const CodeBlockEnhanced = CodeBlockLowlight.extend({
    addNodeView() {
        return ReactNodeViewRenderer(CodeBlockEnhancedNode);
    },
});
