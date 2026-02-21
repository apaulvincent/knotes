import { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Avatar, CircularProgress } from '@mui/material';
import { ShieldCheck, Lock, Smartphone } from 'lucide-react';
import { User } from 'firebase/auth';
import { authenticator } from '@otplib/preset-browser';
import { QRCodeSVG } from 'qrcode.react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface GoogleAuthenticatorProps {
    user: User;
    onVerified: () => void;
}

const GoogleAuthenticator = ({ user, onVerified }: GoogleAuthenticatorProps) => {
    const [token, setToken] = useState('');
    const [error, setError] = useState(false);
    const [isSetup, setIsSetup] = useState(false);
    const [secret, setSecret] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserSecret = async () => {
            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists() && userDoc.data().mfaSecret) {
                    setSecret(userDoc.data().mfaSecret);
                    setIsSetup(false);
                } else {
                    // Generate new secret for setup
                    const newSecret = authenticator.generateSecret();
                    setSecret(newSecret);
                    setIsSetup(true);
                }
            } catch (err) {
                console.error("Error checking MFA status:", err);
            } finally {
                setLoading(false);
            }
        };

        checkUserSecret();
    }, [user.uid]);

    const handleVerify = async () => {
        const isValid = authenticator.check(token, secret);

        if (isValid) {
            if (isSetup) {
                // Save the secret to Firestore once verified during setup
                try {
                    await setDoc(doc(db, 'users', user.uid), {
                        mfaSecret: secret,
                        updatedAt: new Date()
                    }, { merge: true });
                } catch (err) {
                    console.error("Error saving MFA secret:", err);
                    return;
                }
            }
            onVerified();
        } else {
            setError(true);
            setToken('');
            setTimeout(() => setError(false), 500);
        }
    };

    const otpauth = isSetup ? authenticator.keyuri(user.email || 'user', 'KNotes', secret) : '';

    if (loading) {
        return (
            <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc' }}>
                <CircularProgress color="primary" />
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
                color: '#1e293b'
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
                    borderRadius: 1,
                    bgcolor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    maxWidth: 450,
                    width: '95%',
                    textAlign: 'center',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
            >
                <Box sx={{ position: 'relative' }}>
                    <Avatar
                        src={user.photoURL || ''}
                        sx={{ width: 80, height: 80, border: '4px solid #6366f1', mb: 1 }}
                    />
                    <Box
                        sx={{
                            position: 'absolute', bottom: 4, right: 0,
                            bgcolor: '#6366f1', borderRadius: '50%', p: 0.5,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <ShieldCheck size={16} color="white" />
                    </Box>
                </Box>

                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#1e293b' }}>
                        {isSetup ? 'Setup Two-Factor Auth' : 'Security Verification'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        {isSetup
                            ? 'Scan this QR code with Google Authenticator to secure your vault.'
                            : 'Enter the 6-digit code from your Google Authenticator app.'}
                    </Typography>
                </Box>

                {isSetup && (
                    <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, mb: 2, border: '1px solid #e2e8f0' }}>
                        <QRCodeSVG value={otpauth} size={180} />
                    </Box>
                )}

                <Box sx={{ width: '100%' }}>
                    <TextField
                        autoFocus
                        fullWidth
                        placeholder="000 000"
                        value={token}
                        error={error}
                        onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                        onKeyPress={(e) => e.key === 'Enter' && token.length === 6 && handleVerify()}
                        inputProps={{
                            maxLength: 6,
                            style: {
                                textAlign: 'center',
                                fontSize: '2rem',
                                letterSpacing: '0.5rem',
                                color: '#1e293b',
                                fontWeight: 700
                            }
                        }}
                        variant="standard"
                        helperText={error ? "Invalid code. Please try again." : ""}
                        FormHelperTextProps={{ sx: { textAlign: 'center', color: '#f87171' } }}
                        sx={{
                            mb: 4,
                            '& .MuiInput-underline:before': { borderBottomColor: 'rgba(0,0,0,0.1)' },
                            '& .MuiInput-underline:hover:before': { borderBottomColor: 'rgba(0,0,0,0.2) !important' }
                        }}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleVerify}
                        disabled={token.length !== 6}
                        startIcon={<Lock size={20} />}
                        sx={{
                            py: 1.5,
                            borderRadius: 1,
                            bgcolor: '#6366f1',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)',
                            '&:hover': { bgcolor: '#4f46e5', transform: 'translateY(-2px)' }
                        }}
                    >
                        {isSetup ? 'Verify & Setup' : 'Unlock Vault'}
                    </Button>

                    <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'text.secondary' }}>
                        <Smartphone size={16} />
                        <Typography variant="caption">
                            Secure Auth for {user.email}
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default GoogleAuthenticator;
