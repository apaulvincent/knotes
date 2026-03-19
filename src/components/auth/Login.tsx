import { Alert, Box, Button, CircularProgress, Divider, IconButton, Paper, TextField, Typography } from '@mui/material';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import Logo from '../common/Logo';

interface LoginProps {
    onGoogleLogin: () => Promise<any>;
    onEmailSignIn: (email: string, password: string) => Promise<any>;
    onEmailSignUp: (email: string, password: string) => Promise<any>;
    onPasswordReset: (email: string) => Promise<any>;
}

const Login = ({ onGoogleLogin, onEmailSignIn, onEmailSignUp, onPasswordReset }: LoginProps) => {
    const [mode, setMode] = useState<'options' | 'signin' | 'signup' | 'forgot'>('options');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
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
        setMessage(null);
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

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            await onPasswordReset(email);
            setMessage('Password reset email sent! Check your inbox.');
            setLoading(false);
            // Optionally switch back to signin after a delay
            setTimeout(() => setMode('signin'), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email');
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
                    <Logo size={72} />
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
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Logo size={20} />}
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
                        {mode === 'signin' ? 'Welcome Back' : mode === 'forgot' ? 'Reset Password' : 'Create Account'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {mode === 'signin' 
                            ? 'Enter your credentials to access your notes' 
                            : mode === 'forgot'
                            ? 'Enter your email to receive a reset link'
                            : 'Join KNotes to start vaulting your thoughts'}
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ width: '100%' }} onClose={() => setError(null)}>{error}</Alert>}
                {message && <Alert severity="success" sx={{ width: '100%' }} onClose={() => setMessage(null)}>{message}</Alert>}

                <Box component="form" onSubmit={mode === 'forgot' ? handleResetPassword : handleEmailAuth} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                        label="Email Address"
                        type="email"
                        fullWidth
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                    {mode !== 'forgot' && (
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    )}
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
                        {mode === 'signin' ? 'Sign In' : mode === 'forgot' ? 'Send Reset Link' : 'Sign Up'}
                    </Button>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {mode === 'signin' && (
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => setMode('forgot')}
                            sx={{ textTransform: 'none' }}
                        >
                            Forgot password?
                        </Button>
                    )}
                    
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => {
                            if (mode === 'forgot') setMode('signin');
                            else setMode(mode === 'signin' ? 'signup' : 'signin');
                        }}
                        sx={{ textTransform: 'none' }}
                    >
                        {mode === 'signin' 
                            ? "Don't have an account? Sign up" 
                            : mode === 'forgot'
                            ? "Back to Sign In"
                            : "Already have an account? Sign in"}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default Login;
