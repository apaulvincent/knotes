import { Box, ButtonGroup, Dialog, DialogContent, Divider, IconButton, Menu, MenuItem, Paper, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';
import { marked } from 'marked';
import TurndownService from 'turndown';
import {
    AlertCircle,
    AlertTriangle,
    Bold,
    CheckCircle,
    ChevronDown,
    Code,
    Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
    Image as ImageIcon,
    Info,
    Italic,
    Link as LinkIcon,
    List, ListOrdered,
    ListTodo,
    Minus,
    Palette,
    Quote as QuoteIcon,
    Redo,
    Strikethrough,
    Table as TableIcon,
    Type,
    Underline as UnderlineIcon,
    Undo,
    X,
    MoreHorizontal,
    FileCode,
    FileText
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Callout } from './extensions/Callout';
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
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [isCompact, setIsCompact] = useState(isMobile);
    const [showSecondLayer, setShowSecondLayer] = useState(false);
    const [isMarkdownMode, setIsMarkdownMode] = useState(false);
    const [markdownContent, setMarkdownContent] = useState('');

    useEffect(() => {
        if (isMobile) {
            setIsCompact(true);
            return;
        }

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setIsCompact(entry.contentRect.width < 700);
            }
        });

        if (toolbarRef.current) {
            observer.observe(toolbarRef.current);
        }

        return () => observer.disconnect();
    }, [isMobile]);

    const iconSize = isCompact ? 18 : 20;

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
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Callout,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editable: editable,
    });

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [anchorElColor, setAnchorElColor] = useState<null | HTMLElement>(null);
    const [anchorElTable, setAnchorElTable] = useState<null | HTMLElement>(null);
    const [anchorElCallout, setAnchorElCallout] = useState<null | HTMLElement>(null);
    const [anchorElFormat, setAnchorElFormat] = useState<null | HTMLElement>(null);
    const [anchorElList, setAnchorElList] = useState<null | HTMLElement>(null);

    const handleFormatClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorElFormat(event.currentTarget);
    };

    const handleListClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorElList(event.currentTarget);
    };

    const handleFormatClose = () => {
        setAnchorElFormat(null);
    };

    const handleListClose = () => {
        setAnchorElList(null);
    };

    const handleHeadingClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleColorClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorElColor(event.currentTarget);
    };

    const handleTableClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorElTable(event.currentTarget);
    };

    const handleCalloutClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorElCallout(event.currentTarget);
    };

    const handleHeadingClose = () => {
        setAnchorEl(null);
    };

    const handleColorClose = () => {
        setAnchorElColor(null);
    };

    const handleTableClose = () => {
        setAnchorElTable(null);
    };

    const handleCalloutClose = () => {
        setAnchorElCallout(null);
    };

    const setHeading = (level: any) => {
        if (level === 0) {
            editor?.chain().focus().setParagraph().run();
        } else {
            editor?.chain().focus().toggleHeading({ level }).run();
        }
        handleHeadingClose();
    };

    const toggleMarkdown = async () => {
        if (!editor) return;

        if (isMarkdownMode) {
            // Switching from Markdown to Formatted
            const htmlContent = marked.parse(markdownContent) as string;
            editor.commands.setContent(htmlContent);
            setIsMarkdownMode(false);
        } else {
            // Switching from Formatted to Markdown
            const turndownService = new TurndownService({
                headingStyle: 'atx',
                codeBlockStyle: 'fenced',
                bulletListMarker: '-',
            });
            const markdown = turndownService.turndown(editor.getHTML());
            setMarkdownContent(markdown);
            setIsMarkdownMode(true);
        }
    };

    useEffect(() => {
        if (editor && content !== editor.getHTML() && !isMarkdownMode) {
            editor.commands.setContent(content);
        }
        if (isMarkdownMode) {
            const turndownService = new TurndownService({
                headingStyle: 'atx',
                codeBlockStyle: 'fenced',
                bulletListMarker: '-',
            });
            setMarkdownContent(turndownService.turndown(content));
        }
    }, [content, editor, isMarkdownMode]);

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

    const textColors = [
        { label: 'Default', color: 'inherit' },
        { label: 'Gray', color: '#64748b' },
        { label: 'Red', color: '#ef4444' },
        { label: 'Blue', color: '#3b82f6' },
        { label: 'Green', color: '#22c55e' },
        { label: 'Purple', color: '#a855f7' },
        { label: 'Orange', color: '#f97316' },
    ];

    const highlightColors = [
        { label: 'None', color: 'transparent' },
        { label: 'Yellow', color: '#fef08a' },
        { label: 'Green', color: '#bbf7d0' },
        { label: 'Blue', color: '#bfdbfe' },
        { label: 'Red', color: '#fecaca' },
        { label: 'Purple', color: '#e9d5ff' },
    ];

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {editable && (
                <Paper
                    ref={toolbarRef}
                    elevation={0}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: 'background.paper',
                        borderRadius: 0,
                        border: 'none',
                        position: 'sticky',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 100,
                        mb: 0,
                    }}
                >
                    <Box
                        sx={{
                            p: { xs: 0.5, sm: 1 },
                            display: 'flex',
                            flexWrap: 'nowrap',
                            overflowX: 'auto',
                            '&::-webkit-scrollbar': { display: 'none' },
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none',
                            gap: 0.5,
                            alignItems: 'center',
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

                    {isCompact ? (
                        <>
                            <ButtonGroup variant="text" size="small">
                                <Tooltip title="Formatting">
                                    <IconButton onClick={handleFormatClick} color={editor.isActive('bold') || editor.isActive('italic') || editor.isActive('underline') || editor.isActive('strike') ? 'primary' : 'default'}>
                                        <Bold size={iconSize} />
                                        <ChevronDown size={14} />
                                    </IconButton>
                                </Tooltip>
                                <Menu anchorEl={anchorElFormat} open={Boolean(anchorElFormat)} onClose={handleFormatClose}>
                                    <MenuItem onClick={() => { editor.chain().focus().toggleBold().run(); handleFormatClose(); }} selected={editor.isActive('bold')}>
                                        <Bold size={18} style={{ marginRight: 8 }} /> Bold
                                    </MenuItem>
                                    <MenuItem onClick={() => { editor.chain().focus().toggleItalic().run(); handleFormatClose(); }} selected={editor.isActive('italic')}>
                                        <Italic size={18} style={{ marginRight: 8 }} /> Italic
                                    </MenuItem>
                                    <MenuItem onClick={() => { editor.chain().focus().toggleUnderline().run(); handleFormatClose(); }} selected={editor.isActive('underline')}>
                                        <UnderlineIcon size={18} style={{ marginRight: 8 }} /> Underline
                                    </MenuItem>
                                    <MenuItem onClick={() => { editor.chain().focus().toggleStrike().run(); handleFormatClose(); }} selected={editor.isActive('strike')}>
                                        <Strikethrough size={18} style={{ marginRight: 8 }} /> Strikethrough
                                    </MenuItem>
                                </Menu>
                            </ButtonGroup>

                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                            <ButtonGroup variant="text" size="small">
                                <Tooltip title="Lists">
                                    <IconButton onClick={handleListClick} color={editor.isActive('bulletList') || editor.isActive('orderedList') || editor.isActive('taskList') ? 'primary' : 'default'}>
                                        <List size={iconSize} />
                                        <ChevronDown size={14} />
                                    </IconButton>
                                </Tooltip>
                                <Menu anchorEl={anchorElList} open={Boolean(anchorElList)} onClose={handleListClose}>
                                    <MenuItem onClick={() => { editor.chain().focus().toggleBulletList().run(); handleListClose(); }} selected={editor.isActive('bulletList')}>
                                        <List size={18} style={{ marginRight: 8 }} /> Bullet List
                                    </MenuItem>
                                    <MenuItem onClick={() => { editor.chain().focus().toggleOrderedList().run(); handleListClose(); }} selected={editor.isActive('orderedList')}>
                                        <ListOrdered size={18} style={{ marginRight: 8 }} /> Ordered List
                                    </MenuItem>
                                    <MenuItem onClick={() => { editor.chain().focus().toggleTaskList().run(); handleListClose(); }} selected={editor.isActive('taskList')}>
                                        <ListTodo size={18} style={{ marginRight: 8 }} /> Checklist
                                    </MenuItem>
                                </Menu>
                                <Tooltip title="Code Block">
                                    <IconButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} color={editor.isActive('codeBlock') ? 'primary' : 'default'}>
                                        <Code size={iconSize} />
                                    </IconButton>
                                </Tooltip>
                            </ButtonGroup>
                        </>
                    ) : (
                        <>
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

                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

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
                        </>
                    )}

                    {!isCompact && (
                        <>
                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                            <ButtonGroup variant="text" size="small">
                                <Tooltip title="Text Color & Highlight">
                                    <IconButton onClick={handleColorClick}>
                                        <Palette size={iconSize} />
                                    </IconButton>
                                </Tooltip>
                            </ButtonGroup>

                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                            <ButtonGroup variant="text" size="small">
                                <Tooltip title="Table">
                                    <IconButton
                                        onClick={handleTableClick}
                                        color={editor.isActive('table') ? 'primary' : 'default'}
                                    >
                                        <TableIcon size={iconSize} />
                                        <ChevronDown size={14} />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Callout">
                                    <IconButton onClick={handleCalloutClick} color={editor.isActive('callout') ? 'primary' : 'default'}>
                                        <Info size={iconSize} />
                                        <ChevronDown size={14} />
                                    </IconButton>
                                </Tooltip>
                            </ButtonGroup>

                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

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
                                <Tooltip title="Divider">
                                    <IconButton onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                                        <Minus size={iconSize} />
                                    </IconButton>
                                </Tooltip>
                            </ButtonGroup>

                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

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
                        </>
                    )}

                    <Box sx={{ flexGrow: 1 }} />

                    <ButtonGroup variant="text" size="small">
                        <IconButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                            <Undo size={iconSize} />
                        </IconButton>
                        <IconButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                            <Redo size={iconSize} />
                        </IconButton>
                    </ButtonGroup>

                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                    <ButtonGroup variant="text" size="small">
                        <Tooltip title={isMarkdownMode ? "Formatted View" : "Markdown Source"}>
                            <IconButton onClick={toggleMarkdown} color={isMarkdownMode ? 'secondary' : 'default'}>
                                {isMarkdownMode ? <FileText size={iconSize} /> : <FileCode size={iconSize} />}
                            </IconButton>
                        </Tooltip>
                    </ButtonGroup>
                    
                    {isCompact && (
                        <IconButton
                            onClick={() => setShowSecondLayer(!showSecondLayer)}
                            color={showSecondLayer ? 'primary' : 'default'}
                            size="small"
                            sx={{ ml: 0.5 }}
                        >
                            <MoreHorizontal size={iconSize} />
                        </IconButton>
                    )}
                    </Box>

                    {isCompact && showSecondLayer && (
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'nowrap',
                                overflowX: 'auto',
                                '&::-webkit-scrollbar': { display: 'none' },
                                msOverflowStyle: 'none',
                                scrollbarWidth: 'none',
                                gap: 0.5,
                                p: { xs: 0.5, sm: 1 },
                                pt: 0,
                                alignItems: 'center',
                                borderTop: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <ButtonGroup variant="text" size="small">
                                <Tooltip title="Text Color & Highlight">
                                    <IconButton onClick={handleColorClick}>
                                        <Palette size={iconSize} />
                                    </IconButton>
                                </Tooltip>
                            </ButtonGroup>

                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />

                            <ButtonGroup variant="text" size="small">
                                <Tooltip title="Table">
                                    <IconButton
                                        onClick={handleTableClick}
                                        color={editor.isActive('table') ? 'primary' : 'default'}
                                    >
                                        <TableIcon size={iconSize} />
                                        <ChevronDown size={14} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Callout">
                                    <IconButton onClick={handleCalloutClick} color={editor.isActive('callout') ? 'primary' : 'default'}>
                                        <Info size={iconSize} />
                                        <ChevronDown size={14} />
                                    </IconButton>
                                </Tooltip>
                            </ButtonGroup>

                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />

                            <ButtonGroup variant="text" size="small">
                                <Tooltip title="Quote">
                                    <IconButton onClick={() => editor.chain().focus().toggleBlockquote().run()} color={editor.isActive('blockquote') ? 'primary' : 'default'}>
                                        <QuoteIcon size={iconSize} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Divider">
                                    <IconButton onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                                        <Minus size={iconSize} />
                                    </IconButton>
                                </Tooltip>
                            </ButtonGroup>

                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />

                            <ButtonGroup variant="text" size="small">
                                <Tooltip title="Link">
                                    <IconButton onClick={setLink} color={editor.isActive('link') ? 'primary' : 'default'}>
                                        <LinkIcon size={iconSize} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Image">
                                    <IconButton onClick={addImage}>
                                        <ImageIcon size={iconSize} />
                                    </IconButton>
                                </Tooltip>
                            </ButtonGroup>
                        </Box>
                    )}

                    {/* Shared Menus (rendered regardless of view mode) */}
                    <Menu
                        anchorEl={anchorElColor}
                        open={Boolean(anchorElColor)}
                        onClose={handleColorClose}
                        PaperProps={{ sx: { p: 1, minWidth: 200 } }}
                    >
                        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 'bold' }}>Text Color</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, px: 2, mb: 1 }}>
                            {textColors.map((c) => (
                                <IconButton
                                    key={c.label}
                                    size="small"
                                    onClick={() => {
                                        if (c.color === 'inherit') editor.chain().focus().unsetColor().run();
                                        else editor.chain().focus().setColor(c.color).run();
                                        handleColorClose();
                                    }}
                                    sx={{ 
                                        bgcolor: c.color === 'inherit' ? 'transparent' : c.color,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        width: 24, height: 24,
                                        '&:hover': { bgcolor: c.color === 'inherit' ? 'action.hover' : c.color, opacity: 0.8 }
                                    }}
                                >
                                    {c.color === 'inherit' && <X size={14} />}
                                </IconButton>
                            ))}
                        </Box>
                        <Divider />
                        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 'bold' }}>Highlight</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, px: 2 }}>
                            {highlightColors.map((c) => (
                                <IconButton
                                    key={c.label}
                                    size="small"
                                    onClick={() => {
                                        if (c.color === 'transparent') editor.chain().focus().unsetHighlight().run();
                                        else editor.chain().focus().setHighlight({ color: c.color }).run();
                                        handleColorClose();
                                    }}
                                    sx={{ 
                                        bgcolor: c.color === 'transparent' ? 'transparent' : c.color,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        width: 24, height: 24,
                                        '&:hover': { bgcolor: c.color === 'transparent' ? 'action.hover' : c.color, opacity: 0.8 }
                                    }}
                                >
                                    {c.color === 'transparent' && <X size={14} />}
                                </IconButton>
                            ))}
                        </Box>
                    </Menu>

                    <Menu
                        anchorEl={anchorElTable}
                        open={Boolean(anchorElTable)}
                        onClose={handleTableClose}
                    >
                        <MenuItem onClick={() => { editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); handleTableClose(); }}>
                            Insert Table (3x3)
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => { editor.chain().focus().addColumnBefore().run(); handleTableClose(); }} disabled={!editor.isActive('table')}>Add Column Before</MenuItem>
                        <MenuItem onClick={() => { editor.chain().focus().addColumnAfter().run(); handleTableClose(); }} disabled={!editor.isActive('table')}>Add Column After</MenuItem>
                        <MenuItem onClick={() => { editor.chain().focus().deleteColumn().run(); handleTableClose(); }} disabled={!editor.isActive('table')}>Delete Column</MenuItem>
                        <Divider />
                        <MenuItem onClick={() => { editor.chain().focus().addRowBefore().run(); handleTableClose(); }} disabled={!editor.isActive('table')}>Add Row Before</MenuItem>
                        <MenuItem onClick={() => { editor.chain().focus().addRowAfter().run(); handleTableClose(); }} disabled={!editor.isActive('table')}>Add Row After</MenuItem>
                        <MenuItem onClick={() => { editor.chain().focus().deleteRow().run(); handleTableClose(); }} disabled={!editor.isActive('table')}>Delete Row</MenuItem>
                        <Divider />
                        <MenuItem onClick={() => { editor.chain().focus().deleteTable().run(); handleTableClose(); }} disabled={!editor.isActive('table')} sx={{ color: 'error.main' }}>Delete Table</MenuItem>
                    </Menu>

                    <Menu
                        anchorEl={anchorElCallout}
                        open={Boolean(anchorElCallout)}
                        onClose={handleCalloutClose}
                    >
                        <MenuItem onClick={() => { editor.chain().focus().toggleCallout({ type: 'info' }).run(); handleCalloutClose(); }}>
                            <Info size={18} style={{ marginRight: 8, color: '#3b82f6' }} /> Info Callout
                        </MenuItem>
                        <MenuItem onClick={() => { editor.chain().focus().toggleCallout({ type: 'warning' }).run(); handleCalloutClose(); }}>
                            <AlertTriangle size={18} style={{ marginRight: 8, color: '#f59e0b' }} /> Warning Callout
                        </MenuItem>
                        <MenuItem onClick={() => { editor.chain().focus().toggleCallout({ type: 'success' }).run(); handleCalloutClose(); }}>
                            <CheckCircle size={18} style={{ marginRight: 8, color: '#10b981' }} /> Success Callout
                        </MenuItem>
                        <MenuItem onClick={() => { editor.chain().focus().toggleCallout({ type: 'error' }).run(); handleCalloutClose(); }}>
                            <AlertCircle size={18} style={{ marginRight: 8, color: '#ef4444' }} /> Error Callout
                        </MenuItem>
                    </Menu>
                </Paper>
            )}

            {isMarkdownMode ? (
                <Box sx={{ p: { xs: 1.5, sm: 3 }, flexGrow: 1 }}>
                    <TextField
                        fullWidth
                        multiline
                        minRows={10}
                        variant="outlined"
                        value={markdownContent}
                        onChange={(e) => {
                            const newMarkdown = e.target.value;
                            setMarkdownContent(newMarkdown);
                            onChange(marked.parse(newMarkdown) as string);
                        }}
                        placeholder="Type your markdown here..."
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                                fontSize: '0.95rem',
                                lineHeight: 1.6,
                                backgroundColor: 'background.paper',
                                '& fieldset': { borderColor: 'divider' },
                                '&:hover fieldset': { borderColor: 'primary.main' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                            },
                        }}
                    />
                </Box>
            ) : (
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
                            padding: '0.5rem 1rem',
                            backgroundColor: 'action.hover',
                            fontStyle: 'italic',
                            margin: '1rem 0',
                            color: 'text.secondary',
                        },
                        '& hr': {
                            border: 'none',
                            borderTop: '1px solid',
                            borderColor: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                            margin: '1.5rem 0',
                            opacity: theme.palette.mode === 'dark' ? 0.8 : 0.6,
                        },
                        // Table Styles
                        '& table': {
                            borderCollapse: 'collapse',
                            tableLayout: 'fixed',
                            width: '100%',
                            margin: '1.5rem 0',
                            overflow: 'hidden',
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: 'divider',
                            '& td, & th': {
                                minWidth: '1em',
                                border: '1px solid',
                                borderColor: 'divider',
                                padding: '12px 14px',
                                verticalAlign: 'top',
                                boxSizing: 'border-box',
                                position: 'relative',
                                '& > *': {
                                    margin: 0,
                                },
                            },
                            '& th': {
                                fontWeight: 'bold',
                                textAlign: 'left',
                                backgroundColor: 'action.hover',
                            },
                        },
                         // Callout Styles
                        '& .callout': {
                            padding: '1.25rem',
                            margin: '1.5rem 0',
                            borderRadius: 0,
                            border: '1px solid',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            '&.callout-info': {
                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
                                borderColor: 'rgba(59, 130, 246, 0.3)',
                                borderLeftWidth: '5px',
                                borderLeftColor: '#3b82f6',
                            },
                            '&.callout-warning': {
                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.1)' : '#fffbeb',
                                borderColor: 'rgba(245, 158, 11, 0.3)',
                                borderLeftWidth: '5px',
                                borderLeftColor: '#f59e0b',
                            },
                            '&.callout-success': {
                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4',
                                borderColor: 'rgba(16, 185, 129, 0.3)',
                                borderLeftWidth: '5px',
                                borderLeftColor: '#10b981',
                            },
                            '&.callout-error': {
                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
                                borderColor: 'rgba(239, 68, 68, 0.3)',
                                borderLeftWidth: '5px',
                                borderLeftColor: '#ef4444',
                            },
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
            )}

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
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                        }}
                    >
                        <X size={20} />
                    </IconButton>
                    {previewImage && (
                        <img
                            src={previewImage}
                            alt="Preview"
                            style={{
                                maxWidth: '100vw',
                                maxHeight: '90vh',
                                display: 'block',
                                width: 'auto',
                                height: 'auto',
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
