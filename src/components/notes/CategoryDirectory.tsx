import { Box, Typography, List, ListItem, ListItemButton, ListItemText, Paper, Grid } from '@mui/material';
import { Category } from '../../types/note';
import { useNavigate } from 'react-router-dom';

interface CategoryDirectoryProps {
    categories: Category[];
    onCategorySelect: (id: string | null) => void;
}

const CategoryDirectory = ({ categories, onCategorySelect }: CategoryDirectoryProps) => {
    const navigate = useNavigate();

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
        navigate(`/categories/${id}`);
        onCategorySelect(id);
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
                                    <ListItem key={cat.id} disablePadding>
                                        <ListItemButton
                                            onClick={() => handleSelect(cat.id)}
                                            sx={{
                                                px: 0,
                                                py: 0.5,
                                                '&:hover': { backgroundColor: 'transparent', '& .MuiListItemText-primary': { color: 'primary.main' } }
                                            }}
                                        >
                                            <ListItemText
                                                primary={cat.name}
                                                primaryTypographyProps={{
                                                    variant: 'body1',
                                                    fontWeight: 500,
                                                    color: 'text.secondary',
                                                    whiteSpace: 'nowrap'
                                                }}
                                                sx={{
                                                    '& .MuiListItemText-primary': {
                                                        transition: 'color 0.2s'
                                                    }
                                                }}
                                            />
                                        </ListItemButton>
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
