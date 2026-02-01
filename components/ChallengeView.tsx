"use client";

import { useEffect, useState } from "react";
import { Challenge, ActivityLog, ChallengeActivity } from "@/lib/types";
import { getActivityLogs, logActivity } from "@/app/actions";
import { calculateMilestones, Milestone, getDailyStatus, getDatesInRange } from "@/lib/challenge-dates";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, CheckCircle2, ChevronLeft, Loader2, Info, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChallengeViewProps {
    challenge: Challenge;
    userEmail: string;
}

export default function ChallengeView({ challenge, userEmail }: ChallengeViewProps) {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const milestones = calculateMilestones(challenge);

    useEffect(() => {
        fetchLogs();
    }, [userEmail]);

    const fetchLogs = async () => {
        setIsLoading(true);
        const res = await getActivityLogs(userEmail);
        if (res.success) {
            setActivities(res.activities);
        }
        setIsLoading(false);
    };

    const handleLogToggle = async (date: string, activity: ChallengeActivity, milestoneLabel: string) => {
        const existing = activities.find(a => a.date === date && a.activityId === activity.id);

        const newLog: ActivityLog = {
            id: existing?.id || Math.random().toString(36).substring(7),
            userEmail,
            challengeId: challenge.id,
            activityId: activity.id,
            date,
            milestoneLabel,
            completed: !existing?.completed,
            value: activity.requiredAmount,
            timestamp: new Date().toISOString()
        };

        const res = await logActivity(newLog);
        if (res.success) {
            setActivities(prev => {
                const filtered = prev.filter(a => !(a.date === date && a.activityId === activity.id));
                return [newLog, ...filtered];
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <header className="px-6 py-8 border-b border-border/50 bg-card/30 backdrop-blur-md sticky top-0 z-30">
                <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4 group">
                    <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter">{challenge.name}</h1>
                        <p className="text-muted-foreground mt-2 max-w-lg leading-relaxed">{challenge.description}</p>
                    </div>
                    <div className="hidden sm:flex bg-primary/10 p-4 rounded-3xl text-primary">
                        <Trophy className="w-8 h-8" />
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                    <div className="flex items-center px-4 py-2 bg-muted/50 rounded-2xl border border-border/50 text-xs font-bold uppercase tracking-wider">
                        <Calendar className="w-4 h-4 mr-2 text-primary" />
                        {challenge.startDate} — {challenge.endDate}
                    </div>
                </div>
            </header>

            <main className="px-6 py-10 space-y-10">
                {milestones.map((milestone, idx) => {
                    const dates = getDatesInRange(milestone.startDate, milestone.endDate);

                    return (
                        <div key={idx} className="space-y-6">
                            <h3 className="text-xl font-bold px-1 flex items-center gap-2">
                                <span className="bg-primary w-2 h-6 rounded-full" />
                                {milestone.label}
                                <span className="text-xs font-medium text-muted-foreground ml-2">
                                    {milestone.startDate} to {milestone.endDate}
                                </span>
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {dates.map((date) => {
                                    const isToday = new Date().toISOString().split('T')[0] === date;
                                    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
                                    const shortDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    const dayStatus = getDailyStatus(date, activities, challenge.activities || []);

                                    return (
                                        <div
                                            key={date}
                                            className={cn(
                                                "p-6 rounded-3xl border transition-all duration-300",
                                                isToday ? "ring-2 ring-primary ring-offset-4 ring-offset-background bg-card shadow-xl" : "bg-card/40 border-border/50",
                                                dayStatus === 'green' && "bg-emerald-500/5 border-emerald-500/20"
                                            )}
                                        >
                                            <div className="flex justify-between items-center mb-6">
                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{dayName}</span>
                                                    <h4 className="text-lg font-bold">{shortDate}</h4>
                                                </div>
                                                {dayStatus === 'green' && (
                                                    <div className="bg-emerald-500 text-white p-1 rounded-full">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {challenge.activities?.map((activity) => {
                                                    const log = activities.find(a => a.date === date && a.activityId === activity.id);
                                                    const isCompleted = log?.completed || false;

                                                    return (
                                                        <button
                                                            key={activity.id}
                                                            onClick={() => handleLogToggle(date, activity, milestone.label)}
                                                            className={cn(
                                                                "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 group",
                                                                isCompleted
                                                                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                                                    : "bg-muted/30 border-transparent hover:border-primary/30"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-8 h-8 rounded-full flex items-center justify-center mb-2 font-black text-[10px] uppercase",
                                                                isCompleted ? "bg-white/20" : "bg-primary/10 text-primary"
                                                            )}>
                                                                {activity.name[0]}
                                                            </div>
                                                            <span className="text-[10px] font-bold truncate w-full text-center px-1 uppercase tracking-tighter">
                                                                {activity.name}
                                                            </span>
                                                            <span className="text-[8px] opacity-70 mt-0.5">
                                                                {activity.requiredAmount} {activity.unit}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </main>
        </div>
    );
}
