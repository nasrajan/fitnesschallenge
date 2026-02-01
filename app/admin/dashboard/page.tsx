"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import UserManagement from "@/components/admin/UserManagement";
import ChallengeManagement from "@/components/admin/ChallengeManagement";
import { Button } from "@/components/ui/button";
import { Users, Trophy, LogOut, ShieldCheck, LayoutDashboard, Settings } from "lucide-react";

type Tab = 'users' | 'challenges';

export default function AdminDashboard() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('users');
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Protect the route
    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'ADMIN') {
                router.push('/admin/login');
            } else {
                setIsCheckingAuth(false);
            }
        }
    }, [user, authLoading, router]);

    if (authLoading || isCheckingAuth) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-primary font-bold animate-pulse">Initializing Terminal...</div>;
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground selection:bg-primary/30 flex flex-col">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/20">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-black text-lg tracking-tighter uppercase italic">Control <span className="text-primary tracking-normal not-italic lowercase font-bold font-sans">Center</span></span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-right hidden xs:flex flex-col">
                                <p className="font-bold text-white text-xs leading-tight">{user?.firstName} {user?.lastName}</p>
                                <p className="text-primary/70 text-[9px] uppercase tracking-widest font-black leading-tight">Administrator</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={logout} className="hover:bg-destructive/10 group h-9 w-9 border border-white/5">
                                <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Top Navigation Tabs */}
            <nav className="sticky top-16 z-40 w-full border-b border-white/5 bg-black/30 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-1 h-14">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center space-x-2 px-6 h-full text-xs font-bold uppercase tracking-widest transition-all border-b-2 relative ${activeTab === 'users'
                                ? 'text-primary border-primary bg-primary/5'
                                : 'text-muted-foreground border-transparent hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            <span>Users</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('challenges')}
                            className={`flex items-center space-x-2 px-6 h-full text-xs font-bold uppercase tracking-widest transition-all border-b-2 relative ${activeTab === 'challenges'
                                ? 'text-primary border-primary bg-primary/5'
                                : 'text-muted-foreground border-transparent hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Trophy className="w-4 h-4" />
                            <span>Challenges</span>
                        </button>

                        <div className="flex-1" />

                        <div className="hidden md:flex items-center space-x-2 opacity-30">
                            <div className="flex items-center space-x-1 px-4 py-1.5 rounded-full bg-white/5 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                                <LayoutDashboard className="w-3 h-3" />
                                <span>Analytics</span>
                            </div>
                            <div className="flex items-center space-x-1 px-4 py-1.5 rounded-full bg-white/5 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                                <ShieldCheck className="w-3 h-3" />
                                <span>System Logs</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative z-10">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {activeTab === 'users' ? <UserManagement /> : <ChallengeManagement />}
                </div>
            </main>

            {/* Footer / Status Bar */}
            <footer className="w-full border-t border-white/5 bg-black/50 py-3 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50">
                    <div className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse" />
                        System Online
                    </div>
                    <div>&copy; 2026 Fitness Challenge Platform</div>
                </div>
            </footer>
        </div>
    );
}
