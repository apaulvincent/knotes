import { Box, Typography, Paper, Avatar, Button, ToggleButtonGroup, ToggleButton, Divider, Stack } from '@mui/material';
import { User } from 'firebase/auth';
import { Sun, Moon, Monitor, Shield, Mail, Calendar, LogOut } from 'lucide-react';
import { useThemeContext } from '../../contexts/ThemeContext';
import { format } from 'date-fns';

interface AccountPageProps {
    user: User;
    onLogout: () => void;
}

const AccountPage = ({ user, onLogout }: AccountPageProps) => {
    const { mode, setMode } = useThemeContext();

    const handleThemeChange = (
        _event: React.MouseEvent<HTMLElement>,
        newMode: 'light' | 'dark' | 'system' | null,
    ) => {
        if (newMode !== null) {
            setMode(newMode);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 4 } }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
                Account Settings
            </Typography>

            <Stack spacing={4}>
                {/* Profile Section */}
                <Paper elevation={0} sx={{ p: 4, borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                        <Avatar
                            src={user.photoURL || ''}
                            sx={{ width: 100, height: 100, border: '4px solid #6366f1' }}
                        >
                            {user.displayName?.[0]}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {user.displayName}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {user.email}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Mail size={20} color="#64748b" />
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    Email Address
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {user.email}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Calendar size={20} color="#64748b" />
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    Member Since
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {user.metadata.creationTime ? format(new Date(user.metadata.creationTime), 'MMMM dd, yyyy') : 'N/A'}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Shield size={20} color="#6366f1" />
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    Security Status
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#10b981' }}>
                                    2FA Enabled
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </Paper>

                {/* Theme Section */}
                <Paper elevation={0} sx={{ p: 4, borderRadius: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Appearance
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Customize how KNotes looks on your device.
                    </Typography>

                    <ToggleButtonGroup
                        value={mode}
                        exclusive
                        onChange={handleThemeChange}
                        aria-label="theme-mode"
                        fullWidth
                        sx={{
                            bgcolor: 'background.default',
                            p: 0.5,
                            borderRadius: 1,
                            '& .MuiToggleButton-root': {
                                border: 'none',
                                borderRadius: 1,
                                py: 1.5,
                                color: 'text.secondary',
                                '&.Mui-selected': {
                                    bgcolor: 'background.paper',
                                    color: 'primary.main',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    '&:hover': {
                                        bgcolor: 'background.paper',
                                    }
                                }
                            }
                        }}
                    >
                        <ToggleButton value="light" aria-label="light">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Sun size={18} />
                                Light
                            </Box>
                        </ToggleButton>
                        <ToggleButton value="dark" aria-label="dark">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Moon size={18} />
                                Dark
                            </Box>
                        </ToggleButton>
                        <ToggleButton value="system" aria-label="system">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Monitor size={18} />
                                System
                            </Box>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Paper>

                {/* Logout Section */}
                <Box sx={{ pt: 2 }}>
                    <Button
                        variant="outlined"
                        color="error"
                        size="large"
                        startIcon={<LogOut size={20} />}
                        onClick={onLogout}
                        sx={{ borderRadius: 1, px: 4 }}
                    >
                        Sign Out of KNotes
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
};

export default AccountPage;
