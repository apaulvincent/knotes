import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ResizableImage } from './extensions/ResizableImage';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Box, ButtonGroup, Tooltip, IconButton, Paper, Divider, Dialog, DialogContent } from '@mui/material';
import {
    Bold, Italic, List, ListOrdered, Code, Image as ImageIcon,
    Link as LinkIcon, Quote as QuoteIcon, Undo, Redo, X, ListTodo
} from 'lucide-react';
import { useEffect, useState } from 'react';

const lowlight = createLowlight(common);

interface NoteEditorProps {
    content: string;
    onChange: (content: string) => void;
    editable?: boolean;
}

const NoteEditor = ({ content, onChange, editable = true }: NoteEditorProps) => {
    const [previewImage, setPreviewImage] = useState<string | null>(null);

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
            CodeBlockLowlight.configure({
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
                        p: 1,
                        mb: 2,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        backgroundColor: '#f1f5f9',
                        borderRadius: '8px',
                        border: 'none',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10
                    }}
                >
                    <ButtonGroup variant="text" size="small">
                        <Tooltip title="Bold">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                color={editor.isActive('bold') ? 'primary' : 'default'}
                            >
                                <Bold size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Italic">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                color={editor.isActive('italic') ? 'primary' : 'default'}
                            >
                                <Italic size={20} />
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
                                <List size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Ordered List">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                color={editor.isActive('orderedList') ? 'primary' : 'default'}
                            >
                                <ListOrdered size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Checklist">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleTaskList().run()}
                                color={editor.isActive('taskList') ? 'primary' : 'default'}
                            >
                                <ListTodo size={20} />
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
                                <Code size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Quote">
                            <IconButton
                                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                color={editor.isActive('blockquote') ? 'primary' : 'default'}
                            >
                                <QuoteIcon size={20} />
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
                                <LinkIcon size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Image">
                            <IconButton onClick={addImage}>
                                <ImageIcon size={20} />
                            </IconButton>
                        </Tooltip>
                    </ButtonGroup>

                    <Box sx={{ flexGrow: 1 }} />

                    <ButtonGroup variant="text" size="small">
                        <IconButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                            <Undo size={20} />
                        </IconButton>
                        <IconButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                            <Redo size={20} />
                        </IconButton>
                    </ButtonGroup>
                </Paper>
            )}

            <Box
                sx={{
                    flexGrow: 1,
                    '& .tiptap': {
                        outline: 'none',
                        minHeight: '200px',
                        fontSize: '1rem',
                        lineHeight: 1.6,
                        color: '#334155',
                        '& p': { margin: '0.5rem 0' },
                        '& pre': {
                            backgroundColor: '#1e293b',
                            color: '#f8fafc',
                            padding: '1rem',
                            borderRadius: '8px',
                            fontFamily: 'monospace',
                            overflowX: 'auto',
                        },
                        '& code': {
                            backgroundColor: '#f1f5f9',
                            padding: '0.2rem 0.4rem',
                            borderRadius: '4px',
                            fontSize: '0.9em',
                        },
                        '& pre code': {
                            backgroundColor: 'transparent',
                            padding: 0,
                            color: 'inherit',
                        },
                        '& .resizable-image-wrapper': {
                            display: 'inline-block',
                            margin: '1rem 0',
                            maxWidth: '100%',
                        },
                        '& img': {
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: '8px',
                            display: 'block'
                        },
                        '& a': {
                            color: '#6366f1',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                        },
                        '& blockquote': {
                            borderLeft: '4px solid #e2e8f0',
                            paddingLeft: '1rem',
                            fontStyle: 'italic',
                            margin: '1rem 0',
                        }
                    }
                }}
                onClick={(e) => {
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
                                borderRadius: '8px'
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default NoteEditor;
