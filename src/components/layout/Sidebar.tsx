import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import { Avatar, Box, CircularProgress, Divider, IconButton, InputAdornment, List, ListItem, ListItemButton, TextField, Tooltip, Typography } from '@mui/material';
import { format } from 'date-fns';
import { User } from 'firebase/auth';
import { PanelLeftClose, Pin, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Note } from '../../types/note';

interface SidebarProps {
    notes: Note[];
    selectedNoteId: string | null;
    onNoteSelect: (id: string) => void;
    onTogglePin: (id: string, currentStatus: boolean) => void;
    user: User | null;
    onProfileClick: () => void;
    hasMore: boolean;
    onLoadMore: () => void;
    loading: boolean;
    error: string | null;
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
}

const Sidebar = ({
    notes,
    selectedNoteId,
    onNoteSelect,
    onTogglePin,
    user,
    onProfileClick,
    hasMore,
    onLoadMore,
    loading,
    error,
    isSidebarOpen,
    onToggleSidebar
}: SidebarProps) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const observerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading && searchQuery === '') {
                    onLoadMore();
                }
            },
            { threshold: 1.0 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loading, onLoadMore, searchQuery]);

    const filteredNotes = notes.filter(note => {
        const query = searchQuery.toLowerCase();
        return (
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query)
        );
    });

    return (
        <Box
            sx={{
                width: isSidebarOpen ? 300 : 0,
                minWidth: isSidebarOpen ? 300 : 0,
                height: '100vh',
                borderRight: isSidebarOpen ? '1px solid' : 'none',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'background.paper',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                position: 'relative'
            }}
        >
            {/* Header with Space Name */}
            <Box sx={{ p: 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography
                    variant="h6"
                    onClick={() => navigate('/notes')}
                    sx={{
                        fontWeight: 800,
                        color: 'primary.main',
                        letterSpacing: '-0.02em',
                        opacity: isSidebarOpen ? 1 : 0,
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 }
                    }}
                >
                    KNotes
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    <Tooltip title="Categories">
                        <IconButton
                            size="small"
                            onClick={() => navigate('/categories')}
                            sx={{ color: 'text.secondary', opacity: isSidebarOpen ? 1 : 0 }}
                        >
                            <ClassOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Close Sidebar">
                        <IconButton size="small" onClick={onToggleSidebar} sx={{ color: 'text.secondary' }}>
                            <PanelLeftClose size={18} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Box sx={{ px: 1, mt: 1, mb: 2 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    variant="outlined"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={16} color="#94a3b8" />
                            </InputAdornment>
                        ),
                        sx: {
                            borderRadius: 1.5,
                            fontSize: '0.875rem',
                            color: 'text.primary',
                            backgroundColor: 'background.default',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'divider',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main',
                            },
                            '& .MuiInputBase-input::placeholder': {
                                color: 'text.disabled',
                                opacity: 1,
                            }
                        }
                    }}
                />
            </Box>

            <Divider sx={{ opacity: 0.6 }} />

            {/* Notes List Section */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <List sx={{ p: 1, pt: 0 }}>
                    {filteredNotes.map((note) => (
                        <ListItem key={note.id} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                selected={selectedNoteId === note.id}
                                onClick={() => onNoteSelect(note.id)}
                                sx={{
                                    borderRadius: 2,
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    p: 2,
                                    border: '1px solid',
                                    borderColor: selectedNoteId === note.id ? 'primary.light' : 'transparent',
                                    backgroundColor: selectedNoteId === note.id ? 'background.default' : 'transparent',
                                    '&.Mui-selected': {
                                        backgroundColor: 'background.default',
                                        '&:hover': { backgroundColor: 'background.default' },
                                    },
                                    '&:hover': {
                                        backgroundColor: 'action.hover',
                                        borderColor: selectedNoteId === note.id ? 'primary.light' : 'divider',
                                    },
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                                    <Typography
                                        variant="subtitle2"
                                        noWrap
                                        sx={{
                                            fontWeight: 700,
                                            color: selectedNoteId === note.id ? 'primary.main' : 'text.primary',
                                        }}
                                    >
                                        {note.title || 'Untitled'}
                                    </Typography>
                                    <Tooltip title={note.isPinned ? "Unpin" : "Pin"}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onTogglePin(note.id, note.isPinned);
                                            }}
                                            sx={{
                                                ml: 1,
                                                mt: -0.5,
                                                mr: -1,
                                                color: note.isPinned ? 'primary.main' : 'text.disabled',
                                                transform: note.isPinned ? 'none' : 'rotate(-45deg)',
                                                '&:hover': { 
                                                    color: 'primary.main',
                                                    transform: 'none'
                                                },
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <Pin size={14} fill={note.isPinned ? 'currentColor' : 'none'} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        lineHeight: 1.5,
                                        mb: 1,
                                        opacity: 0.8,
                                        wordBreak: 'break-all'
                                    }}
                                >
                                    {note.content.replace(/<[^>]*>/g, '').substring(0, 100) || 'No additional content'}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, fontSize: '10px' }}>
                                        {note.updatedAt ? format(note.updatedAt.toDate(), 'MMM dd') : 'Just now'}
                                    </Typography>
                                </Box>
                            </ListItemButton>
                        </ListItem>
                    ))}
                    {error && (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="body2" color="error" sx={{ mb: 1, fontWeight: 700 }}>
                                Error loading notes
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {error.includes('index') ? (
                                    <>
                                        This query requires a Firestore index. Check the browser console and click the link to create it.
                                    </>
                                ) : error}
                            </Typography>
                        </Box>
                    )}

                    {filteredNotes.length === 0 && !loading && !error && (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            {/* Empty as requested */}
                        </Box>
                    )}

                    {/* Lazy Load Sentinel */}
                    {hasMore && searchQuery === '' && (
                        <Box
                            ref={observerRef}
                            sx={{
                                p: 2,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: 60
                            }}
                        >
                            {loading && <CircularProgress size={24} />}
                        </Box>
                    )}
                </List>
            </Box>

            <Divider />

            {/* Profile Section */}
            <Box sx={{ p: 2 }}>
                <Box
                    onClick={onProfileClick}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: 2,
                        transition: 'background-color 0.2s',
                        '&:hover': {
                            backgroundColor: 'action.hover'
                        }
                    }}
                >
                    <Avatar
                        src={user?.photoURL || ''}
                        sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}
                    >
                        {user?.displayName?.[0] || 'U'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user?.displayName || 'User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px' }}>
                            {user?.email}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Sidebar;
