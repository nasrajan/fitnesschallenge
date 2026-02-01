"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getActivityLogs, getChallenges } from "@/app/actions";
import { ChallengeCard } from "@/components/ChallengeCard";
import { ActivityLog, Challenge } from "@/lib/types";
import { Plus, Target, LogOut, Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const V2_API_BASE = process.env.NEXT_PUBLIC_V2_API_BASE || "http://localhost:8080/api/v2";

export default function Dashboard() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setDataLoading(true);

            const fetchAllData = async () => {
                const [logsRes, challengesRes] = await Promise.all([
                    getActivityLogs(user.email),
                    getChallenges()
                ]);

                let v1Challenges = challengesRes.success ? (challengesRes.challenges || []) : [];
                let v2Challenges: Challenge[] = [];

                try {
                    const v2Res = await fetch(`${V2_API_BASE}/challenges`);
                    if (v2Res.ok) {
                        v2Challenges = await v2Res.json();
                    }
                } catch (e) {
                    console.error("V2 API Offline");
                }

                if (logsRes.success) setActivities(logsRes.activities);
                setChallenges([...v1Challenges, ...v2Challenges]);
                setDataLoading(false);
            };

            fetchAllData();
        }
    }, [user]);

    if (authLoading || (user && dataLoading)) {
        return <div className="flex h-screen items-center justify-center bg-black"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
    }

    if (!user) return null;

    return (
        <div className="pb-24 min-h-screen bg-[#050505] text-white">
            <header className="px-6 py-6 flex justify-between items-center bg-black/40 backdrop-blur-2xl sticky top-0 z-10 border-b border-white/5">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Authenticated Participant</p>
                    <h1 className="text-3xl font-black capitalize tracking-tighter italic">{user.firstName} <span className="not-italic text-primary">.</span></h1>
                </div>
                <div className="flex gap-3">
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Link href="/leaderboard">
                                <Button variant="outline" size="icon" className="rounded-2xl border-white/10 bg-white/5 hover:bg-primary/20 hover:text-primary transition-all">
                                    <Trophy className="h-5 w-5" />
                                </Button>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="font-bold bg-primary text-primary-foreground border-none">Rankings</TooltipContent>
                    </Tooltip>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={logout}
                                className="rounded-2xl text-destructive border border-destructive/10 bg-destructive/5 hover:bg-destructive hover:text-white transition-all"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="font-bold bg-destructive text-white border-none">Exit Terminal</TooltipContent>
                    </Tooltip>
                </div>
            </header>

            <main className="px-6 py-10 space-y-16 max-w-7xl mx-auto">
                {/* Active Challenges */}
                <section className="space-y-8">
                    <div className="flex justify-between items-end px-2">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <Target className="w-5 h-5 text-primary animate-pulse" />
                                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/50">Active Missions</h2>
                            </div>
                            <p className="text-2xl font-bold tracking-tight">Deploy your potential across active events.</p>
                        </div>
                        <Link href="/challenges" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
                            Protocol View
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {challenges.length > 0 ? (
                            challenges.map((challenge, idx) => (
                                <div key={challenge.id || idx} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <ChallengeCard challenge={challenge} />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-24 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem]">
                                <Trophy className="w-16 h-16 text-white/10 mx-auto mb-6" />
                                <p className="text-white/40 font-black uppercase tracking-[0.2em]">Zero Active Deployments</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Recent Activity */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3 px-2">
                        <Plus className="w-5 h-5 text-primary" />
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/50">Telemetry Log</h2>
                    </div>
                    {activities.length === 0 ? (
                        <div className="text-center py-16 text-white/30 text-xs font-bold border border-white/5 rounded-[2rem] bg-white/[0.02] uppercase tracking-widest">
                            No data packets received. <br />Engage with a mission to start logging.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activities.slice(0, 6).map((log) => {
                                const challenge = challenges.find(c => c.id === log.challengeId);
                                const activity = challenge?.activities?.find(a => a.id === log.activityId);

                                return (
                                    <div key={log.id} className="flex items-center gap-5 p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-primary/30 transition-all hover:bg-white/[0.05] group">
                                        <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-lg text-primary group-hover:scale-110 transition-transform">
                                            {activity?.name?.[0] || 'A'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-bold text-sm truncate uppercase tracking-tight">{activity?.name || "Activity"}</p>
                                                <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">{new Date(log.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                            <p className="text-xs text-primary font-black uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                                                {log.value} <span className="text-[10px] text-white/40">{activity?.unit}</span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>

            {/* FAB - Adjusted for context */}
            <div className="fixed bottom-10 right-10 z-40">
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <Button size="icon" className="h-20 w-20 rounded-[2.5rem] shadow-[0_20px_50px_rgba(var(--primary),0.3)] bg-primary text-black hover:scale-110 transition-all active:scale-95 ring-8 ring-black/50" asChild>
                            <Link href="/challenges">
                                <Plus className="h-10 w-10 font-black" />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="font-black uppercase tracking-widest bg-white text-black border-none">Log Telemetry</TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}
