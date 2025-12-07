import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/http';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const fetchUser = useCallback(async () => {
        try {
            const { data } = await api.get('/auth/me');
            const profile = {
                id: data.id,
                email: data.email,
                balance: data.balance,
                alias: data.alias,
                is_admin: data.is_admin,
                is_verified: data.is_verified,
            };
            setUser(profile);
            return profile;
        }
        catch {
            localStorage.removeItem('token');
            setUser(null);
            return null;
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser();
        }
        else {
            setIsLoading(false);
        }
    }, [fetchUser]);
    const login = useCallback(async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.access_token);
        await fetchUser();
    }, [fetchUser]);
    const register = useCallback(async (email, password, alias) => {
        await api.post('/auth/register', { email, password, alias });
        // Auto-login after registration
        await login(email, password);
    }, [login]);
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/auth';
    }, []);
    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser: fetchUser,
    };
    return (_jsx(AuthContext.Provider, { value: value, children: children }));
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
