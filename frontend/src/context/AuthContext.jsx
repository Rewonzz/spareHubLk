import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session from localStorage on first load, then refresh from server
    useEffect(() => {
        const storedToken = localStorage.getItem('sparehub_token');
        const storedUser = localStorage.getItem('sparehub_user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            // Refresh user data from server to get latest isPremium/premiumStatus
            fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${storedToken}` },
            })
                .then(res => res.ok ? res.json() : null)
                .then(freshUser => {
                    if (freshUser) {
                        const userData = {
                            id: freshUser._id,
                            name: freshUser.name,
                            phone: freshUser.phone,
                            email: freshUser.email,
                            location: freshUser.location,
                            role: freshUser.role,
                            avatar: freshUser.avatar || null,
                            isPremium: freshUser.isPremium,
                            premiumStatus: freshUser.premiumStatus,
                            businessName: freshUser.businessName,
                            businessType: freshUser.businessType,
                            city: freshUser.city,
                        };
                        localStorage.setItem('sparehub_user', JSON.stringify(userData));
                        setUser(userData);
                    }
                })
                .catch(() => {})
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (newToken, userData) => {
        localStorage.setItem('sparehub_token', newToken);
        localStorage.setItem('sparehub_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('sparehub_token');
        localStorage.removeItem('sparehub_user');
        setToken(null);
        setUser(null);
    };

    // Update user data in state and localStorage (e.g. after avatar upload)
    const updateUser = (updatedUser) => {
        localStorage.setItem('sparehub_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoggedIn: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
