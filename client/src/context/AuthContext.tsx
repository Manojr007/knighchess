import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

interface User {
    _id: string;
    username: string;
    email: string;
    rating: number;
    profile?: {
        avatar: string;
        bio: string;
        country: string;
    };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Fetch user details if needed, or rely on stored user data
            // For now, we assume token is enough or we fetch /me
            axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`)
                .then(res => setUser(res.data))
                .catch(() => logout());
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
