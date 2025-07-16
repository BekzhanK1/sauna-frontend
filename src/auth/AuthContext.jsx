import { createContext, useState, useEffect } from "react";
import api from "../api/axios";
import API_URLS from "../api/config";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // for initial loading

    const login = async (username, password) => {
        try {
            const res = await api.post(API_URLS.login, { username, password });
            localStorage.setItem("access", res.data.access);
            localStorage.setItem("refresh", res.data.refresh);

            const me = await api.get(API_URLS.me);
            setUser(me.data);
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setUser(null);
    };

    useEffect(() => {
        const fetchUser = async () => {
            const access = localStorage.getItem("access");
            if (access) {
                try {
                    const me = await api.get(API_URLS.me);
                    setUser(me.data);
                } catch {
                    logout();
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
