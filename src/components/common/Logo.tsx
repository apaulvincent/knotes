import { Box } from '@mui/material';

interface LogoProps {
    size?: number;
}

const Logo = ({ size = 64 }: LogoProps) => {
    return (
        <Box
            sx={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 50%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
        >
            <Box
                sx={{
                    color: 'white',
                    fontSize: size * 0.55,
                    fontWeight: 900,
                    fontFamily: '"Outfit", "Inter", sans-serif',
                    lineHeight: 1,
                    mt: -0.2,
                }}
            >
                K
            </Box>
        </Box>
    );
};

export default Logo;
