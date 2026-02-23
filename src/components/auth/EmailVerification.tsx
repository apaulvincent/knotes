import { Box, Button, Typography, Paper, Alert } from '@mui/material';
import { Mail, RefreshCw, LogOut } from 'lucide-react';
import { useState } from 'react';

interface EmailVerificationProps {
    email: string | null;
    onResend: () => Promise<void>;
    onLogout: () => Promise<void>;
}

const EmailVerification = ({ email, onResend, onLogout }: EmailVerificationProps) => {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleResend = async () => {
        setLoading(true);
        setError(null);
        try {
            await onResend();
            setSent(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send verification email');
        } finally {
            setLoading(false);
        }
    };

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
                    maxWidth: 450,
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
                        mb: 1,
                    }}
                >
                    <Mail size={32} />
                </Box>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#1e293b' }}>
                        Verify your email
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        We've sent a verification link to <strong>{email}</strong>.
                        Please check your inbox (and spam folder) to activate your account.
                    </Typography>
                </Box>

                {sent && (
                    <Alert severity="success" sx={{ width: '100%' }}>
                        Verification email resent!
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ width: '100%' }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <Typography variant="caption" color="text.disabled">
                        After verifying, please refresh this page to continue.
                    </Typography>

                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => window.location.reload()}
                        sx={{ py: 1.5, textTransform: 'none', fontWeight: 600 }}
                    >
                        I've Verified My Email
                    </Button>

                    <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        startIcon={<RefreshCw size={20} className={loading ? 'animate-spin' : ''} />}
                        onClick={handleResend}
                        disabled={loading}
                        sx={{ py: 1.5, textTransform: 'none', fontWeight: 600 }}
                    >
                        Resend Verification Email
                    </Button>

                    <Button
                        variant="text"
                        startIcon={<LogOut size={18} />}
                        onClick={onLogout}
                        sx={{ textTransform: 'none', color: 'text.secondary' }}
                    >
                        Wait, this isn't me? Sign Out
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default EmailVerification;
