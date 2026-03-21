import { Box, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import { Check, Edit2, X, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category } from '../../types/note';

interface CategoryDirectoryProps {
    categories: Category[];
    onCategorySelect: (id: string | null) => void;
    onUpdateCategory: (id: string, name: string) => Promise<void>;
    onDeleteCategory: (id: string) => Promise<void>;
}

const CategoryDirectory = ({ categories, onCategorySelect, onUpdateCategory, onDeleteCategory }: CategoryDirectoryProps) => {
    const navigate = useNavigate();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);

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

    const cancelEditing = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(null);
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 4 }, width: '100%', maxWidth: '1200px', mx: 'auto' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, color: 'text.primary' }}>
                Categories
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 4, sm: 6 } }}>
                {letters.map((letter) => (
                    <Box key={letter}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 800,
                                mb: 2,
                                color: 'text.primary',
                            }}
                        >
                            {letter}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {grouped[letter].map((cat) => (
                                <Box key={cat.id} sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    {editingId === cat.id ? (
                                        <Box 
                                            sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: 1, 
                                                bgcolor: 'background.paper', 
                                                borderRadius: '32px', 
                                                px: 2, 
                                                py: 0.5,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                            }}
                                        >
                                            <TextField
                                                size="small"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSave(e);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                                autoFocus
                                                variant="standard"
                                                InputProps={{ disableUnderline: true }}
                                                sx={{ 
                                                    '& .MuiInputBase-input': { py: 0.5, fontSize: '0.95rem' },
                                                    minWidth: '120px'
                                                }}
                                            />
                                            <IconButton size="small" onClick={handleSave} color="primary" sx={{ p: 0.5 }}>
                                                <Check size={16} />
                                            </IconButton>
                                            <IconButton size="small" onClick={cancelEditing} color="error" sx={{ p: 0.5 }}>
                                                <X size={16} />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                borderRadius: '32px',
                                                px: 3,
                                                py: 1,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                '&:hover': {
                                                    bgcolor: 'primary.dark',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                                                    '& .actions': { opacity: 1, maxWidth: '100px', ml: 1 }
                                                }
                                            }}
                                            onClick={() => handleSelect(cat.id)}
                                        >
                                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'inherit' }}>
                                                {cat.name}
                                            </Typography>
                                            <Box 
                                                className="actions"
                                                sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 0.5,
                                                    opacity: 0,
                                                    maxWidth: 0,
                                                    overflow: 'hidden',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                <Tooltip title="Edit Category">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={(e) => startEditing(e, cat)}
                                                        sx={{ p: 0.5, color: 'inherit', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                                                    >
                                                        <Edit2 size={14} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={deleteId === cat.id ? "Click again to confirm" : "Delete Category"}>
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            if (deleteId === cat.id) {
                                                                onDeleteCategory(cat.id);
                                                                setDeleteId(null);
                                                            } else {
                                                                setDeleteId(cat.id);
                                                            }
                                                        }}
                                                        onMouseLeave={() => {
                                                            if (deleteId === cat.id) setDeleteId(null);
                                                        }}
                                                        onBlur={() => {
                                                            if (deleteId === cat.id) setDeleteId(null);
                                                        }}
                                                        sx={{ 
                                                            p: 0.5, 
                                                            color: deleteId === cat.id ? '#ff4d4d' : 'inherit', 
                                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } 
                                                        }}
                                                    >
                                                        {deleteId === cat.id ? <Check size={14} /> : <Trash2 size={14} />}
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                ))}
            </Box>
            
            {categories.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5 }}>
                    <Typography variant="body1">No categories created yet.</Typography>
                </Box>
            )}
        </Box>
    );
};

export default CategoryDirectory;
