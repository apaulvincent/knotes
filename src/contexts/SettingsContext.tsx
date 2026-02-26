import React, { createContext, useContext, useEffect, useState } from 'react';

interface SidebarSettings {
    showCategories: boolean;
    showPreviewText: boolean;
    showDate: boolean;
}

interface SettingsContextType {
    sidebarSettings: SidebarSettings;
    updateSidebarSettings: (settings: Partial<SidebarSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sidebarSettings, setSidebarSettings] = useState<SidebarSettings>(() => {
        const saved = localStorage.getItem('knotes-sidebar-settings');
        return saved ? JSON.parse(saved) : {
            showCategories: true,
            showPreviewText: true,
            showDate: true
        };
    });

    useEffect(() => {
        localStorage.setItem('knotes-sidebar-settings', JSON.stringify(sidebarSettings));
    }, [sidebarSettings]);

    const updateSidebarSettings = (settings: Partial<SidebarSettings>) => {
        setSidebarSettings(prev => ({ ...prev, ...settings }));
    };

    return (
        <SettingsContext.Provider value={{ sidebarSettings, updateSidebarSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
