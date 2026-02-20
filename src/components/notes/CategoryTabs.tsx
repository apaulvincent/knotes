import { Box, Tabs, Tab, Button } from '@mui/material';
import { Plus } from 'lucide-react';

interface CategoryTabsProps {
    categories: { id: string; name: string }[];
    selectedCategoryId: string;
    onSelect: (id: string) => void;
    onAdd: () => void;
    onAddNote: () => void;
}

const CategoryTabs = ({ categories, selectedCategoryId, onSelect, onAdd, onAddNote }: CategoryTabsProps) => {
    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', mb: 3 }}>
            <Tabs
                value={selectedCategoryId}
                onChange={(_, value) => onSelect(value)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    '& .MuiTabs-indicator': {
                        backgroundColor: '#6366f1',
                        height: 3,
                        borderRadius: '3px 3px 0 0',
                    },
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        minWidth: 'auto',
                        px: 3,
                        color: '#64748b',
                        '&.Mui-selected': {
                            color: '#1e293b',
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
            <Box sx={{ ml: 'auto', pl: 2, display: 'flex', gap: 1 }}>
                <Button
                    startIcon={<Plus size={18} />}
                    variant="contained"
                    size="small"
                    onClick={onAddNote}
                    sx={{ boxShadow: 'none' }}
                >
                    New Note
                </Button>
                <Button
                    startIcon={<Plus size={18} />}
                    size="small"
                    onClick={onAdd}
                    sx={{ color: '#64748b' }}
                >
                    New Category
                </Button>
            </Box>
        </Box>
    );
};

export default CategoryTabs;
