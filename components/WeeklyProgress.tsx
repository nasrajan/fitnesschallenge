"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ActivityLog } from "@/lib/types";
import { CHALLENGE_WEEKS, getDatesInRange, getDailyStatus, getWeeklyStats } from "@/lib/challenge-dates";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function WeeklyProgress({ activities }: { activities: ActivityLog[] }) {
    const router = useRouter();

    const handleDayClick = (date: string) => {
        router.push(`/log?date=${date}`);
    };

    return (
        <div className="space-y-6">
            {CHALLENGE_WEEKS.map((week) => {
                const days = getDatesInRange(week.start, week.end);
                const stats = getWeeklyStats(week.start, week.end, activities);

                return (
                    <div
                        key={week.id}
                        className={cn(
                            "border border-border/50 rounded-2xl p-4 shadow-sm transition-all duration-500",
                            stats.isSuccessful
                                ? "bg-emerald-500/15 border-emerald-500/40 shadow-emerald-500/10 shadow-xl ring-1 ring-emerald-500/20"
                                : "bg-card"
                        )}
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h3 className={cn(
                                "font-bold text-sm flex items-center gap-2",
                                stats.isSuccessful && "text-emerald-700 dark:text-emerald-400"
                            )}>
                                {week.label}
                                {stats.isSuccessful && <span className="text-emerald-500 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded italic">Goal Met</span>}
                            </h3>
                            <span className="text-xs text-muted-foreground">{new Date(week.start).toLocaleDateString([], { month: 'short', day: 'numeric' })} - {new Date(week.end).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {days.map((date) => {
                                const status = getDailyStatus(date, activities);
                                const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'narrow' });
                                const isToday = new Date().toISOString().split('T')[0] === date;
                                const shortDate = new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });

                                return (
                                    <Tooltip key={date} delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <div
                                                className="flex flex-col items-center gap-1 cursor-pointer group outline-none hover:bg-sky-100/50 p-2 -m-2 rounded-xl transition-all duration-300"
                                                onClick={() => handleDayClick(date)}
                                                tabIndex={0}
                                            >
                                                <div
                                                    className={cn(
                                                        "w-full aspect-square rounded-md transition-all duration-300 group-hover:scale-110 group-focus:ring-2 group-focus:ring-sky-500 group-focus:ring-offset-1",
                                                        status === 'green' && "bg-emerald-500 shadow-emerald-500/30 shadow-md group-hover:bg-emerald-600",
                                                        status === 'yellow' && "bg-amber-400 shadow-amber-400/30 shadow-md group-hover:bg-amber-500",
                                                        status === 'grey' && "bg-secondary/50 group-hover:bg-sky-200",
                                                        isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                                    )}
                                                />
                                                <span className="text-[10px] text-muted-foreground font-medium group-hover:text-sky-600 transition-colors">{dayName}</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            {shortDate}
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
