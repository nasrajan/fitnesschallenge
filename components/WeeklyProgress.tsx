import React from "react";
import { ActivityLog } from "@/lib/types";
import { CHALLENGE_WEEKS, getDatesInRange, getDailyStatus } from "@/lib/challenge-dates";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";

// Minimal Tooltip impl since I didn't install shadcn tooltip perfectly, 
// using title attribute as fallback or simple div if simple.
// Actually, let's build a simple custom tooltip-like behavior or just use title for simplicity/speed
// given the "Mobile Friendly" request (tooltips are tricky on mobile).
// I'll render the date below the box or just use simple blocks.
// User checking boxes: "Week 1", then 7 blocks.

export function WeeklyProgress({ activities }: { activities: ActivityLog[] }) {
    return (
        <div className="space-y-6">
            {CHALLENGE_WEEKS.map((week) => {
                const days = getDatesInRange(week.start, week.end);

                return (
                    <div key={week.id} className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-sm">{week.label}</h3>
                            <span className="text-xs text-muted-foreground">{new Date(week.start).toLocaleDateString([], { month: 'short', day: 'numeric' })} - {new Date(week.end).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {days.map((date) => {
                                const status = getDailyStatus(date, activities);
                                const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'narrow' }); // M, T, W...
                                const isToday = new Date().toISOString().split('T')[0] === date;

                                return (
                                    <div key={date} className="flex flex-col items-center gap-1">
                                        <div
                                            className={cn(
                                                "w-full aspect-square rounded-md transition-all",
                                                status === 'green' && "bg-emerald-500 shadow-emerald-500/30 shadow-md",
                                                status === 'yellow' && "bg-amber-400 shadow-amber-400/30 shadow-md",
                                                status === 'grey' && "bg-secondary/50",
                                                isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                            )}
                                            title={`${date}: ${status === 'green' ? 'All Done!' : status === 'yellow' ? 'Partial' : 'No Activity'}`}
                                        />
                                        <span className="text-[10px] text-muted-foreground">{dayName}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
