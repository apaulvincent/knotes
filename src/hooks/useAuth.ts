import { useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    User
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

const SESSION_DURATION = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const loginTime = localStorage.getItem('loginTime');
                const now = Date.now();

                if (loginTime) {
                    const timeElapsed = now - parseInt(loginTime);
                    if (timeElapsed > SESSION_DURATION) {
                        handleLogout();
                        return;
                    }
                } else {
                    localStorage.setItem('loginTime', now.toString());
                }
                setUser(user);
            } else {
                setUser(null);
                localStorage.removeItem('loginTime');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            localStorage.setItem('loginTime', Date.now().toString());
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('loginTime');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return {
        user,
        loading,
        handleLogin,
        handleLogout
    };
};
