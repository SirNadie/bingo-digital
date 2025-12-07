import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import api from '../api/http';
import { Me } from '../types';

interface AuthContextType {
    user: Me | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, alias: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<Me | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<Me | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = useCallback(async (): Promise<Me | null> => {
        try {
            const { data } = await api.get('/auth/me');
            const profile: Me = {
                id: data.id,
                email: data.email,
                balance: data.balance,
                alias: data.alias,
                is_admin: data.is_admin,
                is_verified: data.is_verified,
            };
            setUser(profile);
            return profile;
        } catch {
            localStorage.removeItem('token');
            setUser(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser();
        } else {
            setIsLoading(false);
        }
    }, [fetchUser]);

    const login = useCallback(async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.access_token);
        await fetchUser();
    }, [fetchUser]);

    const register = useCallback(async (email: string, password: string, alias: string) => {
        await api.post('/auth/register', { email, password, alias });
        // Auto-login after registration
        await login(email, password);
    }, [login]);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/auth';
    }, []);

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser: fetchUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
