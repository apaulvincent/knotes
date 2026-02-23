import { Box, Button, Typography, Paper, TextField, Divider, Alert, CircularProgress, IconButton } from '@mui/material';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    onGoogleLogin: () => Promise<any>;
    onEmailSignIn: (email: string, password: string) => Promise<any>;
    onEmailSignUp: (email: string, password: string) => Promise<any>;
}

const Login = ({ onGoogleLogin, onEmailSignIn, onEmailSignUp }: LoginProps) => {
    const [mode, setMode] = useState<'options' | 'signin' | 'signup'>('options');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await onGoogleLogin();
        } catch (err: any) {
            setError(err.message || 'Failed to sign in with Google');
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (mode === 'signin') {
                await onEmailSignIn(email, password);
            } else {
                await onEmailSignUp(email, password);
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
            setLoading(false);
        }
    };

    if (mode === 'options') {
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
                        gap: 3,
                        borderRadius: 2,
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        maxWidth: 400,
                        width: '90%',
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
                            mb: 1,
                        }}
                    >
                        <Mail size={32} />
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#1e293b' }}>
                            KNotes
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Your premium vault for thoughts and code.
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}

                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Mail size={20} />}
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                backgroundColor: '#1e293b',
                                '&:hover': { backgroundColor: '#334155' }
                            }}
                        >
                            Continue with Google
                        </Button>

                        <Divider sx={{ my: 1 }}>
                            <Typography variant="body2" color="text.disabled">OR</Typography>
                        </Divider>

                        <Button
                            variant="outlined"
                            fullWidth
                            size="large"
                            onClick={() => setMode('signin')}
                            sx={{ py: 1.5, textTransform: 'none', fontWeight: 600 }}
                        >
                            Sign in with Email
                        </Button>

                        <Button
                            variant="text"
                            fullWidth
                            onClick={() => setMode('signup')}
                            sx={{ textTransform: 'none', fontWeight: 500 }}
                        >
                            Don't have an account? Sign up
                        </Button>
                    </Box>
                </Paper>
            </Box>
        );
    }

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
                    gap: 3,
                    borderRadius: 2,
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    maxWidth: 400,
                    width: '90%',
                }}
            >
                <IconButton
                    onClick={() => setMode('options')}
                    sx={{ alignSelf: 'flex-start', mb: -2, ml: -2 }}
                >
                    <ArrowLeft size={20} />
                </IconButton>

                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#1e293b' }}>
                        {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {mode === 'signin' ? 'Enter your credentials to access your notes' : 'Join KNotes to start vaulting your thoughts'}
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}

                <Box component="form" onSubmit={handleEmailAuth} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                        label="Email Address"
                        type="email"
                        fullWidth
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={loading}
                        endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowRight size={20} />}
                        sx={{
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            mt: 1
                        }}
                    >
                        {mode === 'signin' ? 'Sign In' : 'Sign Up'}
                    </Button>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                        sx={{ textTransform: 'none' }}
                    >
                        {mode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default Login;
