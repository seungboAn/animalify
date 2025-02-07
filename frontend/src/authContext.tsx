import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
    user: string | null;
    login: (username: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<string | null>(localStorage.getItem('username') || null);

    const login = (username: string) => {
        setUser(username);
        localStorage.setItem('username', username);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('username');
    };

    const value: AuthContextType = {
        user,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within a AuthProvider");
    }
    return context;
}; 