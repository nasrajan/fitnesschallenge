import { ActivityLog } from "./types";

export const CHALLENGE_WEEKS = [
    { id: 1, label: "Week 1", start: "2026-01-19", end: "2026-01-25" },
    { id: 2, label: "Week 2", start: "2026-01-26", end: "2026-02-01" },
    { id: 3, label: "Week 3", start: "2026-02-02", end: "2026-02-08" },
    { id: 4, label: "Week 4", start: "2026-02-09", end: "2026-02-15" },
];

export function getDatesInRange(startDate: string, endDate: string): string[] {
    const dates = [];
    const currDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currDate <= lastDate) {
        dates.push(currDate.toISOString().split('T')[0]);
        currDate.setDate(currDate.getDate() + 1);
    }
    return dates;
}

export type DayStatus = 'green' | 'yellow' | 'grey';

export interface WeeklyStats {
    waterDays: number;
    walkDays: number;
    workoutDays: number;
    ramadanDays: number;
    isSuccessful: boolean;
}

export function getDailyStatus(date: string, logs: ActivityLog[]): DayStatus {
    const dayLogs = logs.filter(l => l.date === date && l.completed);
    if (dayLogs.length === 0) return 'grey';

    const uniqueTypes = new Set(dayLogs.map(l => l.type));

    // Check if we have all 4 types
    // Types are: WALK, WATER, WORKOUT, RAMADAN_PREP
    if (uniqueTypes.size === 4) return 'green';

    return 'yellow';
}

export function getWeeklyStats(startDate: string, endDate: string, allLogs: ActivityLog[]): WeeklyStats {
    const weekLogs = allLogs.filter(l => l.date >= startDate && l.date <= endDate && l.completed);

    // Group logs by date to count days each activity type was done
    const activityDays = {
        WATER: new Set<string>(),
        WALK: new Set<string>(),
        WORKOUT: new Set<string>(),
        RAMADAN_PREP: new Set<string>()
    };

    weekLogs.forEach(log => {
        if (activityDays[log.type as keyof typeof activityDays]) {
            activityDays[log.type as keyof typeof activityDays].add(log.date);
        }
    });

    const stats = {
        waterDays: activityDays.WATER.size,
        walkDays: activityDays.WALK.size,
        workoutDays: activityDays.WORKOUT.size,
        ramadanDays: activityDays.RAMADAN_PREP.size,
    };

    return {
        ...stats,
        isSuccessful: stats.waterDays >= 3 && stats.walkDays >= 5 && stats.workoutDays >= 5 && stats.ramadanDays >= 5
    };
}

