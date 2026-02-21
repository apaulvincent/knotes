import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { getThemeConfig } from '../theme/theme';
import useMediaQuery from '@mui/material/useMediaQuery';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    resolvedMode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem('knotes-theme-mode');
        return (saved as ThemeMode) || 'system';
    });

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const resolvedMode = useMemo(() => {
        if (mode === 'system') {
            return prefersDarkMode ? 'dark' : 'light';
        }
        return mode;
    }, [mode, prefersDarkMode]);

    useEffect(() => {
        localStorage.setItem('knotes-theme-mode', mode);
    }, [mode]);

    const theme = useMemo(() => createTheme(getThemeConfig(resolvedMode)), [resolvedMode]);

    return (
        <ThemeContext.Provider value={{ mode, setMode, resolvedMode }}>
            <MUIThemeProvider theme={theme}>
                {children}
            </MUIThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
};
