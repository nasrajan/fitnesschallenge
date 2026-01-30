"use client";

import { useEffect, useState } from "react";
import { getLeaderboard } from "@/app/actions";
import { CHALLENGE_WEEKS, getDatesInRange, getDailyStatus, getWeeklyStats } from "@/lib/challenge-dates";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Medal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { ActivityLog } from "@/lib/types";

interface LeaderboardEntry {
    firstName: string;
    lastName: string;
    score: number;
    email: string;
    logs: ActivityLog[];
}

export default function LeaderboardPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const today = new Date().toISOString().split('T')[0];
    const initialWeek = CHALLENGE_WEEKS.find(w => today >= w.start && today <= w.end) || CHALLENGE_WEEKS[0];
    const [selectedWeek, setSelectedWeek] = useState(initialWeek);
    const weekDays = getDatesInRange(selectedWeek.start, selectedWeek.end);

    useEffect(() => {
        setLoading(true);
        getLeaderboard(selectedWeek.start, selectedWeek.end).then((res) => {
            if (res.success && res.leaderboard) {
                const formatted = res.leaderboard.map((entry: any) => ({
                    ...entry,
                    score: parseInt(entry.score),
                    // Ensure logs is proper array (sometimes sql returns string representation of json if driver not clever)
                    // But vercel/postgres usually returns object.
                    logs: typeof entry.logs === 'string' ? JSON.parse(entry.logs) : entry.logs
                }));
                // Sort by score mainly, but if logs are empty ensure they fall back? SQL does sort.
                setLeaderboard(formatted);
            }
            setLoading(false);
        });
    }, [selectedWeek]);

    return (
        <div className="min-h-screen bg-background pb-10">
            <header className="px-4 py-4 flex items-center gap-4 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-lg font-bold">Leaderboard</h1>
                    <select
                        className="bg-transparent text-xs text-muted-foreground border-none p-0 focus:ring-0 cursor-pointer hover:text-foreground transition-colors"
                        value={selectedWeek.id}
                        onChange={(e) => {
                            const week = CHALLENGE_WEEKS.find(w => w.id === parseInt(e.target.value));
                            if (week) setSelectedWeek(week);
                        }}
                    >
                        {CHALLENGE_WEEKS.map(w => (
                            <option key={w.id} value={w.id}>
                                {w.label}: {new Date(w.start).toLocaleDateString([], { month: 'short', day: 'numeric' })} - {new Date(w.end).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </option>
                        ))}
                    </select>
                </div>
            </header>

            <main className="px-6 py-6 font-sans">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {leaderboard.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                                No activities recorded this week yet. <br /> Be the first!
                            </div>
                        ) : (
                            leaderboard.map((entry, index) => {
                                const rank = index + 1;
                                const isMe = user?.email === entry.email;
                                const stats = getWeeklyStats(selectedWeek.start, selectedWeek.end, entry.logs);

                                return (
                                    <div
                                        key={entry.email}
                                        className={cn(
                                            "flex flex-col gap-3 p-4 rounded-2xl border transition-all duration-500",
                                            isMe ? "bg-primary/5 border-primary ring-1 ring-primary/50" : "bg-card border-border/50 shadow-sm",
                                            stats.isSuccessful && "bg-emerald-500/15 border-emerald-500/40 shadow-emerald-500/10 shadow-lg"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "h-8 w-8 flex items-center justify-center rounded-full font-bold text-sm shrink-0",
                                                entry.score > 0 && rank === 1 ? "text-white bg-yellow-500 shadow-md shadow-yellow-500/20" :
                                                    entry.score > 0 && rank === 2 ? "text-white bg-slate-400 shadow-md shadow-slate-400/20" :
                                                        entry.score > 0 && rank === 3 ? "text-white bg-amber-600 shadow-md shadow-amber-600/20" :
                                                            "text-muted-foreground bg-secondary"
                                            )}>
                                                {entry.score > 0 && rank <= 3 ? <Medal className="h-5 w-5" /> : rank}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className={cn(
                                                        "font-bold truncate text-base flex items-center gap-2",
                                                        stats.isSuccessful && "text-emerald-700 dark:text-emerald-400"
                                                    )}>
                                                        {entry.firstName} {entry.lastName.charAt(0)}.
                                                        {isMe && <span className="text-xs font-normal text-muted-foreground ml-2">(You)</span>}
                                                        {stats.isSuccessful && <Trophy className="h-4 w-4 text-emerald-500" />}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className={cn("text-xl font-black", stats.isSuccessful && "text-emerald-600")}>{entry.score}</span>
                                            </div>
                                        </div>

                                        {/* 7-Day Grid */}
                                        <div className="grid grid-cols-7 gap-1.5 pl-12">
                                            {weekDays.map((date) => {
                                                const status = getDailyStatus(date, entry.logs);
                                                return (
                                                    <div key={date} className="flex flex-col items-center gap-1">
                                                        <div
                                                            className={cn(
                                                                "w-full aspect-square rounded-[4px] transition-all",
                                                                status === 'green' && "bg-emerald-500",
                                                                status === 'yellow' && "bg-amber-400",
                                                                status === 'grey' && "bg-secondary/50",
                                                            )}
                                                            title={`${date}: ${status === 'green' ? 'All Done' : status === 'yellow' ? 'Partial' : 'No Activity'}`}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
