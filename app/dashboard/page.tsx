"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ActivityLog } from "@/lib/types";
import { getActivityLogs } from "@/app/actions"; // Server Action
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Trophy, Droplets, Target, Moon, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { WeeklyProgress } from "@/components/WeeklyProgress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Dashboard() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setDataLoading(true);
            getActivityLogs(user.email).then((res) => {
                if (res.success && res.activities) {
                    setActivities(res.activities);
                }
                setDataLoading(false);
            });
        } else if (!authLoading) {
            // If auth done and no user, we might be redirected soon, but stop loading
            setDataLoading(false);
        }
    }, [user, authLoading]);

    if (authLoading || (user && dataLoading)) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (!user) return null; // Should redirect in middleware or layout, but handling here too.

    // Calculate Metrics
    const walkLogs = activities.filter(a => a.type === 'WALK' && a.completed);
    const totalMiles = walkLogs.reduce((acc, curr) => acc + (curr.value || 0), 0);

    const waterLogs = activities.filter(a => a.type === 'WATER' && a.completed);
    const totalWater = waterLogs.reduce((acc, curr) => acc + (curr.value || 0), 0);

    const workoutCount = activities.filter(a => a.type === 'WORKOUT' && a.completed).length;

    const ramadanCount = activities.filter(a => a.type === 'RAMADAN_PREP' && a.completed).length;

    return (
        <div className="pb-24">
            {/* Header */}
            <header className="px-6 py-6 flex justify-between items-center bg-card/50 backdrop-blur-md sticky top-0 z-10 border-b border-border/50">
                <div>
                    <p className="text-sm text-muted-foreground">Welcome back,</p>
                    <h1 className="text-2xl font-bold capitalize">{user.firstName}</h1>
                </div>
                <div className="flex gap-2">
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Link href="/leaderboard">
                                <Button variant="outline" size="icon">
                                    <Trophy className="h-5 w-5 text-yellow-600" />
                                </Button>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Leaderboard</TooltipContent>
                    </Tooltip>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={logout}
                                className="text-destructive border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 hover:text-destructive"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Log Out</TooltipContent>
                    </Tooltip>
                </div>
            </header>

            <main className="px-6 py-6 space-y-8">
                {/* Weekly Progress */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Challenge Progress</h2>
                    <WeeklyProgress activities={activities} />
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Total Stats</h2>
                    {/* Progress Grid */}
                    <div className="grid grid-cols-2 gap-4">

                        {/* Walk */}
                        <div className="col-span-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Trophy className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="text-sm font-medium opacity-80">Goal: 5,000</span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-4xl font-bold tracking-tight">{totalMiles.toLocaleString()}</h3>
                                    <p className="text-sm opacity-80 font-medium">Miles Walked</p>
                                </div>

                                <div className="mt-4 h-2 w-full bg-black/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white/90 rounded-full" style={{ width: `${Math.min((totalMiles / 5000) * 100, 100)}%` }} />
                                </div>
                            </div>
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                        </div>

                        {/* Water */}
                        <div className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm space-y-3">
                            <div className="h-10 w-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                                <Droplets className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">{totalWater}L</h3>
                                <p className="text-xs text-muted-foreground">Water Consumed</p>
                            </div>
                        </div>

                        {/* Workouts */}
                        <div className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm space-y-3">
                            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                <Target className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">{workoutCount}</h3>
                                <p className="text-xs text-muted-foreground">Workouts Done</p>
                            </div>
                        </div>

                        {/* Ramadan */}
                        <div className="col-span-2 bg-card border border-border/50 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                                <Moon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{ramadanCount} Days</h3>
                                <p className="text-xs text-muted-foreground">Ramadan Preparation Streak</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Recent Activity</h2>
                        {activities.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed rounded-2xl">
                                No activities yet. <br />Start logging today!
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activities.slice(0, 5).map((log) => (
                                    <div key={log.id} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50">
                                        <div className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs",
                                            log.type === 'WALK' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                            log.type === 'WATER' && "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
                                            log.type === 'WORKOUT' && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                                            log.type === 'RAMADAN_PREP' && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                                        )}>
                                            {log.type === 'RAMADAN_PREP' ? 'PREP' : log.type}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <p className="font-medium text-sm capitalize">{log.type.replace('_', ' ').toLowerCase()}</p>
                                                <span className="text-xs text-muted-foreground">{new Date(log.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{log.note || "No notes"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* FAB */}
            <div className="fixed bottom-6 right-6">
                <Link href="/log">
                    <Button size="icon" className="h-14 w-14 rounded-full shadow-xl bg-primary text-primary-foreground hover:scale-110 transition-transform">
                        <Plus className="h-6 w-6" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
