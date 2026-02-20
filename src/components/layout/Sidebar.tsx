import { Box, Typography, List, ListItem, ListItemButton, Divider, Avatar, IconButton, Tooltip } from '@mui/material';
import { Note, Category } from '../../types/note';
import { format } from 'date-fns';
import { User } from 'firebase/auth';
import { LogOut } from 'lucide-react';

interface SidebarProps {
    currentCategory: Category | null;
    notes: Note[];
    selectedNoteId: string | null;
    onNoteSelect: (id: string) => void;
    user: User | null;
    onLogout: () => void;
}

const Sidebar = ({ currentCategory, notes, selectedNoteId, onNoteSelect, user, onLogout }: SidebarProps) => {
    return (
        <Box
            sx={{
                width: 300,
                height: '100vh',
                borderRight: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#fff',
            }}
        >
            <Box sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tag: {currentCategory?.name || 'All Notes'}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {notes.length} notes
                </Typography>
            </Box>

            <Divider />

            <List sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
                {notes.map((note) => (
                    <ListItem key={note.id} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            selected={selectedNoteId === note.id}
                            onClick={() => onNoteSelect(note.id)}
                            sx={{
                                borderRadius: 2,
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                '&.Mui-selected': {
                                    backgroundColor: '#f1f5f9',
                                    border: '1px solid #e2e8f0',
                                    '&:hover': {
                                        backgroundColor: '#f1f5f9',
                                    },
                                },
                                border: '1px solid transparent',
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {note.title || 'Untitled'}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    lineHeight: 1.4,
                                    mb: 1
                                }}
                            >
                                {note.content.replace(/<[^>]*>/g, '').substring(0, 100)}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                                {note.updatedAt ? format(note.updatedAt.toDate(), 'MMM dd, yyyy') : 'Just now'}
                            </Typography>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider />

            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                    src={user?.photoURL || ''}
                    sx={{ width: 36, height: 36, bgcolor: '#6366f1' }}
                >
                    {user?.displayName?.[0] || 'U'}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.displayName || 'User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.email}
                    </Typography>
                </Box>
                <Tooltip title="Sign Out">
                    <IconButton size="small" onClick={onLogout} color="error">
                        <LogOut size={18} />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
};

export default Sidebar;
