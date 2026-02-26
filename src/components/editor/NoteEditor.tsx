import { Box, ButtonGroup, Dialog, DialogContent, Divider, IconButton, Menu, MenuItem, Paper, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import Link from '@tiptap/extension-link';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';
import {
    Bold,
    ChevronDown,
    Code,
    Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    List, ListOrdered,
    ListTodo,
    Quote as QuoteIcon,
    Redo,
    Strikethrough,
    Type,
    Underline as UnderlineIcon,
    Undo,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CodeBlockEnhanced } from './extensions/CodeBlockEnhanced';
import { ResizableImage } from './extensions/ResizableImage';

const lowlight = createLowlight(common);

interface NoteEditorProps {
    content: string;
    onChange: (content: string) => void;
    editable?: boolean;
}

const NoteEditor = ({ content, onChange, editable = true }: NoteEditorProps) => {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const iconSize = isMobile ? 18 : 20;

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
            }),
            ResizableImage.configure({
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: true,
                HTMLAttributes: {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    class: 'editor-link',
                },
            }),
            Underline,
            CodeBlockEnhanced.configure({
                lowlight,
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editable: editable,
    });

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleHeadingClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleHeadingClose = () => {
        setAnchorEl(null);
    };

    const setHeading = (level: any) => {
        if (level === 0) {
            editor.chain().focus().setParagraph().run();
        } else {
            editor.chain().focus().toggleHeading({ level }).run();
        }
        handleHeadingClose();
    };

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    // Listen for custom event from ResizableImageNode
    useEffect(() => {
        const handleOpenModal = (e: any) => {
            setPreviewImage(e.detail.src);
        };
        document.addEventListener('open-image-modal', handleOpenModal);
        return () => document.removeEventListener('open-image-modal', handleOpenModal);
    }, []);

    if (!editor) return null;

    const addImage = () => {
        const url = window.prompt('URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {editable && (
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 0.5, sm: 1 },
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        backgroundColor: 'background.paper',
                        borderRadius: 0,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        position: 'sticky',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 100,
                        mb: 0,
                    }}
                >
                    <ButtonGroup variant="text" size="small">
                        <Tooltip title="Text Style">
                            <IconButton
                                onClick={handleHeadingClick}
                                color={editor.isActive('heading') ? 'primary' : 'default'}
                            >
                                <Type size={iconSize} />
                                <ChevronDown size={14} />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleHeadingClose}
                        >
                            <MenuItem onClick={() => setHeading(0)} selected={editor.isActive('paragraph')}>
                                <Type size={18} style={{ marginRight: 8 }} /> Paragraph
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={() => setHeading(1)} selected={editor.isActive('heading', { level: 1 })}>
                                <Heading1 size={18} style={{ marginRight: 8 }} /> Heading 1
                            </MenuItem>
                            <MenuItem onClick={() => setHeading(2)} selected={editor.isActive('heading', { level: 2 })}>
                                <Heading2 size={18} style={{ marginRight: 8 }} /> Heading 2
                            </MenuItem>
                            <MenuItem onClick={() => setHeading(3)} selected={editor.isActive('heading', { level: 3 })}>
                                <Heading3 size={18} style={{ marginRight: 8 }} /> Heading 3
                            </MenuItem>
                            <MenuItem onClick={() => setHeading(4)} selected={editor.isActive('heading', { level: 4 })}>
                                <Heading4 size={18} style={{ marginRight: 8 }} /> Heading 4
                            </MenuItem>
                            <MenuItem onClick={() => setHeading(5)} selected={editor.isActive('heading', { level: 5 })}>
                                <Heading5 size={18} style={{ marginRight: 8 }} /> Heading 5
                            </MenuItem>
                            <MenuItem onClick={() => setHeading(6)} selected={editor.isActive('heading', { level: 6 })}>
                                <Heading6 size={18} style={{ marginRight: 8 }} /> Heading 6
                            </MenuItem>
                        </Menu>
                    </ButtonGroup>

                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                    <ButtonGroup variant="text" size="small">
                        <Tooltip title="Bold">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                color={editor.isActive('bold') ? 'primary' : 'default'}
                            >
                                <Bold size={iconSize} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Italic">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                color={editor.isActive('italic') ? 'primary' : 'default'}
                            >
                                <Italic size={iconSize} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Underline">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleUnderline().run()}
                                color={editor.isActive('underline') ? 'primary' : 'default'}
                            >
                                <UnderlineIcon size={iconSize} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Strikethrough">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleStrike().run()}
                                color={editor.isActive('strike') ? 'primary' : 'default'}
                            >
                                <Strikethrough size={iconSize} />
                            </IconButton>
                        </Tooltip>
                    </ButtonGroup>

                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                    <ButtonGroup variant="text" size="small">
                        <Tooltip title="Bullet List">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                color={editor.isActive('bulletList') ? 'primary' : 'default'}
                            >
                                <List size={iconSize} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Ordered List">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                color={editor.isActive('orderedList') ? 'primary' : 'default'}
                            >
                                <ListOrdered size={iconSize} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Checklist">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleTaskList().run()}
                                color={editor.isActive('taskList') ? 'primary' : 'default'}
                            >
                                <ListTodo size={iconSize} />
                            </IconButton>
                        </Tooltip>
                    </ButtonGroup>

                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                    <ButtonGroup variant="text" size="small">
                        <Tooltip title="Code Block">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                                color={editor.isActive('codeBlock') ? 'primary' : 'default'}
                            >
                                <Code size={iconSize} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Quote">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                color={editor.isActive('blockquote') ? 'primary' : 'default'}
                            >
                                <QuoteIcon size={iconSize} />
                            </IconButton>
                        </Tooltip>
                    </ButtonGroup>

                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                    <ButtonGroup variant="text" size="small">
                        <Tooltip title="Link">
                            <IconButton
                                onClick={setLink}
                                color={editor.isActive('link') ? 'primary' : 'default'}
                            >
                                <LinkIcon size={iconSize} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Image">
                            <IconButton onClick={addImage}>
                                <ImageIcon size={iconSize} />
                            </IconButton>
                        </Tooltip>
                    </ButtonGroup>

                    <Box sx={{ flexGrow: 1 }} />

                    <ButtonGroup variant="text" size="small">
                        <IconButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                            <Undo size={iconSize} />
                        </IconButton>
                        <IconButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                            <Redo size={iconSize} />
                        </IconButton>
                    </ButtonGroup>
                </Paper>
            )}

            <Box
                sx={{
                    flexGrow: 1,
                    px: { xs: 1, sm: 3 },
                    pb: { xs: 1, sm: 4 },
                    pt: 1,
                    '& .tiptap': {
                        outline: 'none',
                        minHeight: '200px',
                        fontSize: '1rem',
                        lineHeight: 1.6,
                        color: 'text.primary',
                        '& p': { margin: '0.5rem 0' },
                        '& pre': {
                            backgroundColor: '#050a14', // Ultra dark navy
                            color: '#f8fafc', // Off-white
                            padding: '1.25rem',
                            borderRadius: '8px',
                            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                            overflowX: 'auto',
                            border: '1px solid',
                            borderColor: 'rgba(255, 255, 255, 0.05)',
                            boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
                            margin: '1.5rem 0',
                        },
                        '& code': {
                            backgroundColor: 'action.selected',
                            color: 'primary.main',
                            padding: '0.2rem 0.4rem',
                            borderRadius: '4px',
                            fontSize: '0.9em',
                            fontWeight: 500,
                        },
                        '& pre code': {
                            backgroundColor: 'transparent',
                            padding: 0,
                            color: 'inherit',
                        },
                        '& .code-block-enhanced': {
                            position: 'relative',
                            '& pre': {
                                margin: '1.5rem 0',
                            }
                        },
                        '& .resizable-image-wrapper': {
                            display: 'inline-block',
                            margin: '0.25rem',
                            maxWidth: '100%',
                            verticalAlign: 'top',
                        },
                        '& img': {
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: '4px',
                            display: 'inline-block',
                            verticalAlign: 'bottom'
                        },
                        '& a': {
                            color: 'primary.main',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                        },
                        '& blockquote': {
                            borderLeft: '4px solid',
                            borderColor: 'divider',
                            paddingLeft: '1rem',
                            fontStyle: 'italic',
                            margin: '1rem 0',
                            color: 'text.secondary',
                        }
                    }
                }}
                onDoubleClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.tagName === 'IMG') {
                        setPreviewImage((target as HTMLImageElement).src);
                    }
                }}
            >
                <EditorContent editor={editor} />
            </Box>

            {/* Image Preview Modal */}
            <Dialog
                open={Boolean(previewImage)}
                onClose={() => setPreviewImage(null)}
                maxWidth="lg"
                PaperProps={{
                    sx: { backgroundColor: 'transparent', boxShadow: 'none', overflow: 'hidden' }
                }}
            >
                <DialogContent sx={{ p: 0, position: 'relative' }}>
                    <IconButton
                        onClick={() => setPreviewImage(null)}
                        sx={{
                            position: 'absolute',
                            right: 16,
                            top: 16,
                            color: 'white',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                        }}
                    >
                        <X size={24} />
                    </IconButton>
                    {previewImage && (
                        <img
                            src={previewImage}
                            alt="Preview"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '90vh',
                                display: 'block',
                                margin: 'auto',
                                borderRadius: '4px'
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default NoteEditor;
