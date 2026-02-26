import { Backdrop, Box, IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { User } from 'firebase/auth';
import { PanelLeftOpen } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { Category, Note } from '../../types/note';
import Sidebar from './Sidebar';

interface LayoutProps {
    notes: Note[];
    categories: Category[];
    selectedNoteId: string | null;
    onNoteSelect: (id: string) => void;
    onTogglePin: (id: string, currentStatus: boolean) => void;
    onDeleteNote: (id: string) => void;
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
    onDeleteNote,
    user,
    onProfileClick,
    hasMore,
    onLoadMore,
    loading,
    error,
    children
}: LayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Automatically close sidebar on mobile initial load or navigation
    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        } else {
            setIsSidebarOpen(true);
        }
    }, [isMobile, selectedNoteId]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    return (
        <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
            <Backdrop
                sx={{ 
                    zIndex: 1200, 
                    color: '#fff',
                    display: { sm: 'none' } 
                }}
                open={isSidebarOpen && isMobile}
                onClick={toggleSidebar}
            />
            <Sidebar
                notes={notes}
                categories={categories}
                selectedNoteId={selectedNoteId}
                onNoteSelect={(id) => {
                    onNoteSelect(id);
                    if (isMobile) setIsSidebarOpen(false);
                }}
                onTogglePin={onTogglePin}
                onDeleteNote={onDeleteNote}
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
                {(!isSidebarOpen || isMobile) && (
                    <Box sx={{ 
                        position: 'absolute', 
                        top: { xs: 8, sm: 20 }, 
                        left: { xs: 8, sm: 20 }, 
                        zIndex: 1201 // Higher than header to stay floating
                    }}>
                        <Tooltip title="Open Sidebar">
                            <IconButton
                                onClick={toggleSidebar}
                                sx={{
                                    backgroundColor: 'background.paper',
                                    color: 'primary.main',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                    borderRadius: '50%',
                                    width: { xs: 32, sm: 40 },
                                    height: { xs: 32, sm: 40 },
                                    '&:hover': { 
                                        backgroundColor: 'background.paper',
                                        transform: 'scale(1.05)',
                                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
                                    },
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <PanelLeftOpen size={isMobile ? 18 : 22} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
                <Box sx={{ flexGrow: 1, p: { xs: 0, sm: 2 }, overflow: 'hidden' }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default Layout;
