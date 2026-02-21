import { Box, Tabs, Tab, IconButton, Tooltip } from '@mui/material';
import { Plus } from 'lucide-react';

interface CategoryTabsProps {
    categories: { id: string; name: string }[];
    selectedCategoryId: string;
    onSelect: (id: string) => void;
    onAddCategory: () => void;
}

const CategoryTabs = ({ categories, selectedCategoryId, onSelect, onAddCategory }: CategoryTabsProps) => {
    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, display: 'flex', alignItems: 'center' }}>
            <Tabs
                value={selectedCategoryId}
                onChange={(_, value) => onSelect(value)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    '& .MuiTabs-indicator': {
                        backgroundColor: 'primary.main',
                        height: 3,
                        borderRadius: '3px 3px 0 0',
                    },
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        minWidth: 'auto',
                        px: 3,
                        color: 'text.secondary',
                        '&.Mui-selected': {
                            color: 'text.primary',
                            fontWeight: 600,
                        },
                    },
                }}
            >
                <Tab label="All Notes" value="all" />
                {categories.map((cat) => (
                    <Tab key={cat.id} label={cat.name} value={cat.id} />
                ))}
            </Tabs>
            <Tooltip title="New Category">
                <IconButton size="small" onClick={onAddCategory} sx={{ ml: 1, mb: 0.5 }}>
                    <Plus size={20} />
                </IconButton>
            </Tooltip>
        </Box>
    );
};

export default CategoryTabs;
