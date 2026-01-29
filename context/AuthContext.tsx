"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/lib/types";
import { registerUser, loginUser } from "@/app/actions";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    login: (email: string) => Promise<{ success: boolean; error?: string }>;
    register: (user: User) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for active session on mount
        // For now, we still rely on localStorage just to remember *who* is logged in,
        // but the actual data fetching comes from DB.
        // In a real app we'd use cookies/NextAuth for session persistence.
        // Keeping this simple: check local storage for "current_user_email" and re-fetch from DB.

        // Check if window is defined (client-side)
        if (typeof window !== "undefined") {
            const email = localStorage.getItem("fitness_current_user");
            if (email) {
                loginUser(email).then((res) => {
                    if (res.success && res.user) {
                        setUser(res.user);
                    }
                    setIsLoading(false);
                });
            } else {
                setIsLoading(false);
            }
        }
    }, []);

    const login = async (email: string) => {
        setIsLoading(true);
        const result = await loginUser(email);
        if (result.success && result.user) {
            if (typeof window !== "undefined") {
                localStorage.setItem("fitness_current_user", email);
            }
            setUser(result.user);
            setIsLoading(false);
            router.push("/dashboard");
            return { success: true };
        }
        setIsLoading(false);
        return { success: false, error: result.error || "Login failed" };
    };

    const register = async (newUser: User) => {
        setIsLoading(true);
        const result = await registerUser(newUser);
        if (result.success) {
            if (typeof window !== "undefined") {
                localStorage.setItem("fitness_current_user", newUser.email);
            }
            setUser(newUser);
            setIsLoading(false);
            router.push("/dashboard");
            return { success: true };
        }
        setIsLoading(false);
        return { success: false, error: result.error || "Registration failed" };
    };

    const logout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("fitness_current_user");
        }
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
