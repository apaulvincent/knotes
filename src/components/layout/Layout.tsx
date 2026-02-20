import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import CategoryTabs from '../notes/CategoryTabs';
import { Category, Note } from '../../types/note';
import { ReactNode } from 'react';
import { User } from 'firebase/auth';

interface LayoutProps {
    categories: Category[];
    selectedCategoryId: string;
    onCategorySelect: (id: string) => void;
    onAddCategory: () => void;
    onAddNote: () => void;
    currentCategory: Category | null;
    notes: Note[];
    selectedNoteId: string | null;
    onNoteSelect: (id: string) => void;
    user: User | null;
    onLogout: () => void;
    children: ReactNode;
}

const Layout = ({
    categories,
    selectedCategoryId,
    onCategorySelect,
    onAddCategory,
    onAddNote,
    currentCategory,
    notes,
    selectedNoteId,
    onNoteSelect,
    user,
    onLogout,
    children
}: LayoutProps) => {
    return (
        <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Sidebar
                currentCategory={currentCategory}
                notes={notes}
                selectedNoteId={selectedNoteId}
                onNoteSelect={onNoteSelect}
                user={user}
                onLogout={onLogout}
            />

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8fafc' }}>
                <Box sx={{ px: 4, pt: 2 }}>
                    <CategoryTabs
                        categories={categories}
                        selectedCategoryId={selectedCategoryId}
                        onSelect={onCategorySelect}
                        onAdd={onAddCategory}
                        onAddNote={onAddNote}
                    />
                </Box>

                <Box sx={{ flexGrow: 1, px: 4, pb: 4, overflow: 'hidden' }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default Layout;
