"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ActivityType, ActivityLog } from "@/lib/types";
import { getActivityLogsByDate, logActivity } from "@/app/actions"; // Server Action
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trophy, Droplets, Target, Moon, Loader2, Footprints, Activity, Dumbbell } from "lucide-react";
import { cn, sanitizeInput } from "@/lib/utils";
import { useEffect, useCallback } from "react";

const ACTIVITY_CONFIG: Record<ActivityType, { label: string, icon: any, color: string, unit: string }> = {
    WALK: { label: "Walk", icon: Footprints, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30", unit: "Miles" },
    WATER: { label: "Water", icon: Droplets, color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30", unit: "Liters" },
    WORKOUT: { label: "Workout", icon: Activity, color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30", unit: "Minutes" },
    RAMADAN_PREP: { label: "Ramadan Prep", icon: Moon, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30", unit: "Minutes/Acts" },
};

function LogActivityForm() {
    const router = useRouter();
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const dateParam = searchParams.get('date');

    const [date, setDate] = useState(dateParam || new Date().toISOString().split('T')[0]);
    const [activities, setActivities] = useState<Record<ActivityType, { completed: boolean, value: string }>>({
        WALK: { completed: false, value: "" },
        WATER: { completed: false, value: "" },
        WORKOUT: { completed: false, value: "" },
        RAMADAN_PREP: { completed: false, value: "" },
    });
    const [commonNote, setCommonNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const fetchLogs = useCallback(async () => {
        if (!user || !date) return;
        setIsLoading(true);
        try {
            const result = await getActivityLogsByDate(user.email, date);
            if (result.success && result.activities.length > 0) {
                const newActivities = {
                    WALK: { completed: false, value: "" },
                    WATER: { completed: false, value: "" },
                    WORKOUT: { completed: false, value: "" },
                    RAMADAN_PREP: { completed: false, value: "" },
                };
                let note = "";

                result.activities.forEach((log: ActivityLog) => {
                    const type = log.type as ActivityType;
                    if (newActivities[type]) {
                        newActivities[type] = {
                            completed: log.completed,
                            value: log.value ? log.value.toString() : ""
                        };
                        // Use the note from any of the activities as they should be the same now
                        if (log.note) note = log.note;
                    }
                });

                setActivities(newActivities);
                setCommonNote(note);
            } else {
                // Reset to defaults if no logs found for this date
                setActivities({
                    WALK: { completed: false, value: "" },
                    WATER: { completed: false, value: "" },
                    WORKOUT: { completed: false, value: "" },
                    RAMADAN_PREP: { completed: false, value: "" },
                });
                setCommonNote("");
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user, date]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleActivityChange = (type: ActivityType, field: string, val: any) => {
        setActivities(prev => ({
            ...prev,
            [type]: { ...prev[type], [field]: val }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);
        setSuccessMessage("");

        const activeLogs = (Object.keys(activities) as ActivityType[]).filter(type =>
            activities[type].completed || activities[type].value
        );

        if (activeLogs.length === 0) {
            alert("No activities to save");
            setIsSubmitting(false);
            return;
        }

        try {
            const results = await Promise.all(activeLogs.map(type =>
                logActivity({
                    id: crypto.randomUUID(),
                    userEmail: user.email,
                    date,
                    type,
                    completed: activities[type].completed,
                    note: sanitizeInput(commonNote),
                    value: activities[type].value ? parseFloat(activities[type].value) : undefined,
                    timestamp: new Date().toISOString()
                })
            ));

            if (results.every(r => r.success)) {
                setSuccessMessage("Successfully logged your activities!");
                setTimeout(() => setSuccessMessage(""), 3000);
            } else {
                alert("Some activities failed to log");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while saving");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <header className="px-4 py-4 flex items-center gap-4 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-20">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-bold">Log Activities</h1>
            </header>

            <main className="px-4 py-6 relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center min-h-[400px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Date Picker */}
                    <div className="bg-card border border-border/50 rounded-2xl p-3 shadow-sm flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-transparent text-base font-medium focus:outline-none text-right"
                        />
                    </div>

                    {/* Activities Grid */}
                    <div className="grid grid-cols-1 gap-3">
                        {(Object.keys(ACTIVITY_CONFIG) as ActivityType[]).map((type) => {
                            const config = ACTIVITY_CONFIG[type];
                            const Icon = config.icon;
                            const state = activities[type];

                            return (
                                <div key={type} className={cn(
                                    "flex flex-col gap-2 p-3 rounded-2xl border transition-all duration-300",
                                    state.completed ? "bg-primary/5 border-primary shadow-md" : "bg-card border-border/50 shadow-sm"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", config.color)}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <h3 className="font-bold text-sm">{config.label}</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label htmlFor={`${type}-done`} className="text-[10px] font-medium text-muted-foreground">Done</label>
                                            <input
                                                type="checkbox"
                                                id={`${type}-done`}
                                                checked={state.completed}
                                                onChange={(e) => handleActivityChange(type, 'completed', e.target.checked)}
                                                className="h-5 w-5 rounded-md border-muted bg-background checked:bg-primary transition-all cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-0.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{config.unit}</label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder="0.0"
                                            value={state.value}
                                            onChange={(e) => handleActivityChange(type, 'value', e.target.value)}
                                            className="h-9 rounded-lg bg-background/50 border-border/50"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Common Notes */}
                    <div className="bg-card border border-border/50 rounded-2xl p-3 shadow-sm space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Notes (Common to all activities)</label>
                        <Input
                            placeholder="Add notes for today's activities..."
                            value={commonNote}
                            onChange={(e) => setCommonNote(sanitizeInput(e.target.value))}
                            className="h-12 rounded-xl bg-background/50 border-border/50"
                        />
                    </div>

                    {successMessage && (
                        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-emerald-500 text-white py-3 px-6 rounded-2xl shadow-xl text-center font-medium animate-in fade-in slide-in-from-bottom-4 z-50">
                            {successMessage}
                        </div>
                    )}

                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border/50 z-30 sm:relative sm:bg-transparent sm:border-0 sm:p-0">
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full text-lg h-14 rounded-2xl shadow-lg shadow-primary/20 max-w-md mx-auto block"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Save All Activities"}
                        </Button>
                    </div>

                </form>
            </main>
        </div>
    );
}

export default function LogActivityPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <LogActivityForm />
        </Suspense>
    );
}
