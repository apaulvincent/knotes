import { Box, IconButton, Tooltip } from '@mui/material';
import { User } from 'firebase/auth';
import { PanelLeftOpen } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Category, Note } from '../../types/note';
import Sidebar from './Sidebar';

interface LayoutProps {
    notes: Note[];
    categories: Category[];
    selectedNoteId: string | null;
    onNoteSelect: (id: string) => void;
    onTogglePin: (id: string, currentStatus: boolean) => void;
    user: User | null;
    onProfileClick: () => void;
    hasMore: boolean;
    onLoadMore: () => void;
    loading: boolean;
    error: string | null;
    children: ReactNode;
}

const Layout = ({
    notes,
    categories,
    selectedNoteId,
    onNoteSelect,
    onTogglePin,
    user,
    onProfileClick,
    hasMore,
    onLoadMore,
    loading,
    error,
    children
}: LayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    return (
        <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Sidebar
                notes={notes}
                categories={categories}
                selectedNoteId={selectedNoteId}
                onNoteSelect={onNoteSelect}
                onTogglePin={onTogglePin}
                user={user}
                onProfileClick={onProfileClick}
                hasMore={hasMore}
                onLoadMore={onLoadMore}
                loading={loading}
                error={error}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={toggleSidebar}
            />

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'background.default', position: 'relative' }}>
                {!isSidebarOpen && (
                    <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 1201 }}>
                        <Tooltip title="Open Sidebar">
                            <IconButton
                                onClick={toggleSidebar}
                                sx={{
                                    backgroundColor: 'background.paper',
                                    boxShadow: 2,
                                    '&:hover': { backgroundColor: 'action.hover' }
                                }}
                            >
                                <PanelLeftOpen size={20} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
                <Box sx={{ flexGrow: 1, p: 4, overflow: 'hidden' }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default Layout;
