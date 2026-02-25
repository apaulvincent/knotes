import { Box, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Paper, TextField, Tooltip, Typography } from '@mui/material';
import { Check, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category } from '../../types/note';

interface CategoryDirectoryProps {
    categories: Category[];
    onCategorySelect: (id: string | null) => void;
    onUpdateCategory: (id: string, name: string) => Promise<void>;
}

const CategoryDirectory = ({ categories, onCategorySelect, onUpdateCategory }: CategoryDirectoryProps) => {
    const navigate = useNavigate();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    // Group categories by first letter
    const grouped = categories.reduce((acc, cat) => {
        const firstLetter = cat.name.charAt(0).toUpperCase();
        if (!acc[firstLetter]) {
            acc[firstLetter] = [];
        }
        acc[firstLetter].push(cat);
        return acc;
    }, {} as Record<string, Category[]>);

    // Sort letters
    const letters = Object.keys(grouped).sort();

    // Sort categories within each letter
    letters.forEach(letter => {
        grouped[letter].sort((a, b) => a.name.localeCompare(b.name));
    });

    const handleSelect = (id: string) => {
        if (editingId) return; // Don't navigate while editing
        navigate(`/categories/${id}`);
        onCategorySelect(id);
    };

    const startEditing = (e: React.MouseEvent, cat: Category) => {
        e.stopPropagation();
        setEditingId(cat.id);
        setEditingName(cat.name);
    };

    const handleSave = async (e?: React.MouseEvent | React.KeyboardEvent) => {
        if (e) e.stopPropagation();
        if (editingId && editingName.trim()) {
            await onUpdateCategory(editingId, editingName.trim());
        }
        setEditingId(null);
    };

    return (
        <Box sx={{ p: 4, width: '100%', mx: 'auto' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, color: 'text.primary' }}>
                Categories
            </Typography>

            <Grid container spacing={4}>
                {letters.map((letter) => (
                    <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={letter}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                backgroundColor: 'transparent',
                                border: 'none',
                                boxShadow: 'none'
                            }}
                        >
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 900,
                                    color: 'primary.main',
                                    mb: 1,
                                    borderColor: 'primary.light',
                                    display: 'inline-block',
                                    minWidth: '40px'
                                }}
                            >
                                {letter}
                            </Typography>
                            <List sx={{ pt: 0 }}>
                                {grouped[letter].map((cat) => (
                                    <ListItem key={cat.id} disablePadding sx={{ '&:hover .edit-icon': { opacity: 1 } }}>
                                        {editingId === cat.id ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1, py: 0.5 }}>
                                                <TextField
                                                    size="small"
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSave(e)}
                                                    autoFocus
                                                    sx={{ 
                                                        '& .MuiInputBase-input': { py: 0.5, fontSize: '0.9rem' },
                                                        flexGrow: 1
                                                    }}
                                                />
                                                <IconButton size="small" onClick={handleSave} color="primary">
                                                    <Check size={16} />
                                                </IconButton>
                                            </Box>
                                        ) : (
                                            <ListItemButton
                                                onClick={() => handleSelect(cat.id)}
                                                sx={{
                                                    px: 0,
                                                    py: 0.5,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    '&:hover': { backgroundColor: 'transparent', '& .MuiListItemText-primary': { color: 'primary.main' } }
                                                }}
                                            >
                                                <ListItemText
                                                    primary={cat.name}
                                                    primaryTypographyProps={{
                                                        variant: 'body1',
                                                        fontWeight: 500,
                                                        color: 'text.secondary',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                    sx={{
                                                        m: 0,
                                                        mr: 1,
                                                        '& .MuiListItemText-primary': {
                                                            transition: 'color 0.2s'
                                                        }
                                                    }}
                                                />
                                                <Tooltip title="Edit Category">
                                                    <IconButton 
                                                        className="edit-icon"
                                                        size="small" 
                                                        onClick={(e) => startEditing(e, cat)}
                                                        sx={{ opacity: 0, transition: 'opacity 0.2s', p: 0.5 }}
                                                    >
                                                        <Edit2 size={14} />
                                                    </IconButton>
                                                </Tooltip>
                                            </ListItemButton>
                                        )}
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
            {categories.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5 }}>
                    <Typography variant="body1">No categories created yet.</Typography>
                </Box>
            )}
        </Box>
    );
};

export default CategoryDirectory;
