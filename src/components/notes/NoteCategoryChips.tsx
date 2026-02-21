import React, { useState } from 'react';
import { Box, Chip, TextField, Tooltip, Menu, MenuItem, Divider, Typography } from '@mui/material';
import { Plus, Check, Search } from 'lucide-react';
import { Category } from '../../types/note';
import { useNavigate } from 'react-router-dom';

interface NoteCategoryChipsProps {
    categories: Category[];
    selectedCategoryIds: string[];
    onCategoryChange: (ids: string[]) => void;
    onAddCategory: (name: string) => Promise<string | undefined>;
}

const NoteCategoryChips = ({ categories, selectedCategoryIds = [], onCategoryChange, onAddCategory }: NoteCategoryChipsProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [filterText, setFilterText] = useState('');
    const navigate = useNavigate();

    const open = Boolean(anchorEl);

    const handleOpenMenu = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setNewCategoryName('');
        setFilterText('');
    };

    const addCategoryToNote = (id: string) => {
        if (!selectedCategoryIds.includes(id)) {
            onCategoryChange([...selectedCategoryIds, id]);
        }
    };

    const removeCategoryFromNote = (id: string) => {
        onCategoryChange(selectedCategoryIds.filter(catId => catId !== id));
    };

    const handleCreateNew = async () => {
        const name = newCategoryName.trim() || filterText.trim();
        if (name) {
            const newId = await onAddCategory(name);
            if (newId) {
                addCategoryToNote(newId);
            }
            handleCloseMenu();
        }
    };

    const selectedCategories = categories.filter(cat => selectedCategoryIds.includes(cat.id));
    const unselectedCategories = categories.filter(cat =>
        !selectedCategoryIds.includes(cat.id) &&
        cat.name.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
            {/* Show only selected categories */}
            {selectedCategories.map((cat) => (
                <Chip
                    key={cat.id}
                    label={cat.name}
                    color="primary"
                    variant="filled"
                    onClick={() => navigate(`/categories/${cat.id}`)}
                    onDelete={(e) => {
                        e.stopPropagation();
                        removeCategoryFromNote(cat.id);
                    }}
                    sx={{
                        fontWeight: 600,
                        backgroundColor: 'primary.main',
                        '&:hover': {
                            backgroundColor: 'primary.dark',
                        },
                        '& .MuiChip-deleteIcon': {
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&:hover': { color: '#fff' }
                        }
                    }}
                />
            ))}

            {/* Plus button to open menu */}
            <Tooltip title="Add Category">
                <Chip
                    icon={<Plus size={16} />}
                    onClick={handleOpenMenu}
                    variant="outlined"
                    sx={{
                        borderStyle: 'dashed',
                        fontWeight: 600,
                        width: '32px',
                        height: '32px',
                        '& .MuiChip-label': { display: 'none' },
                        '& .MuiChip-icon': {
                            m: 0,
                            color: 'text.secondary'
                        },
                        '&:hover': {
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '& .MuiChip-icon': { color: 'primary.main' }
                        }
                    }}
                />
            </Tooltip>

            {/* Menu for searching/adding categories */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleCloseMenu}
                PaperProps={{
                    sx: {
                        width: 240,
                        maxWidth: '100%',
                        borderRadius: 2,
                        mt: 1,
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    }
                }}
            >
                <Box sx={{ px: 2, py: 1.5 }}>
                    <TextField
                        fullWidth
                        size="small"
                        autoFocus
                        placeholder="Search or create..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateNew();
                        }}
                        InputProps={{
                            startAdornment: <Search size={14} style={{ marginRight: 8, opacity: 0.5 }} />,
                            sx: { borderRadius: 1.5, fontSize: '0.875rem' }
                        }}
                    />
                </Box>

                <Divider />

                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                    {unselectedCategories.length > 0 ? (
                        unselectedCategories.map((cat) => (
                            <MenuItem
                                key={cat.id}
                                onClick={() => {
                                    addCategoryToNote(cat.id);
                                    handleCloseMenu();
                                }}
                                sx={{ fontSize: '0.875rem', py: 1 }}
                            >
                                <Check size={14} style={{ marginRight: 8, opacity: 0 }} />
                                {cat.name}
                            </MenuItem>
                        ))
                    ) : (
                        filterText && (
                            <MenuItem onClick={handleCreateNew} sx={{ fontSize: '0.875rem', py: 1 }}>
                                <Plus size={14} style={{ marginRight: 8, color: 'primary.main' }} />
                                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                                    Create "{filterText}"
                                </Typography>
                            </MenuItem>
                        )
                    )}

                    {!filterText && unselectedCategories.length === 0 && (
                        <Box sx={{ px: 2, py: 2, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                No more categories
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Menu>
        </Box>
    );
};

export default NoteCategoryChips;
