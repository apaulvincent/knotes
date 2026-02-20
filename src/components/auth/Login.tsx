import { Box, Button, Typography, Paper } from '@mui/material';
import { Mail } from 'lucide-react';

interface LoginProps {
    onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
    return (
        <Box
            sx={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    borderRadius: 8,
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    maxWidth: 400,
                    width: '90%',
                    textAlign: 'center',
                }}
            >
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        backgroundColor: '#6366f1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        mb: 2,
                    }}
                >
                    <Mail size={32} />
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#1e293b' }}>
                        KNotes
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Your premium vault for thoughts and code.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<Mail size={20} />}
                    onClick={onLogin}
                    sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: 3,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 600,
                        boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)',
                        '&:hover': {
                            boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.5)',
                        },
                    }}
                >
                    Sign in using gmail
                </Button>
            </Paper>
        </Box>
    );
};

export default Login;
