import { ActivityLog } from "./types";

export const CHALLENGE_WEEKS = [
    { id: 1, label: "Week 1", start: "2026-01-18", end: "2026-01-24" },
    { id: 2, label: "Week 2", start: "2026-01-25", end: "2026-01-31" },
    { id: 3, label: "Week 3", start: "2026-02-01", end: "2026-02-07" },
    { id: 4, label: "Week 4", start: "2026-02-08", end: "2026-02-14" },
];

export const ALL_TIME_WEEK = { id: 0, label: "All Time", start: CHALLENGE_WEEKS[0].start, end: CHALLENGE_WEEKS[3].end };

export function getChallengeRange() {
    return {
        start: CHALLENGE_WEEKS[0].start,
        end: CHALLENGE_WEEKS[CHALLENGE_WEEKS.length - 1].end
    };
}

export function getDatesInRange(startDate: string, endDate: string): string[] {
    const dates = [];

    // Parse dates in local timezone to avoid UTC shifts
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

    const currDate = new Date(startYear, startMonth - 1, startDay);
    const lastDate = new Date(endYear, endMonth - 1, endDay);

    while (currDate <= lastDate) {
        const year = currDate.getFullYear();
        const month = String(currDate.getMonth() + 1).padStart(2, '0');
        const day = String(currDate.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);
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
        isSuccessful: stats.waterDays >= 5 && stats.walkDays >= 5 && stats.workoutDays >= 3 && stats.ramadanDays >= 5
    };
}

export function getAllTimeStats(allLogs: ActivityLog[]): { isSuccessful: boolean } {
    // A user is successful "All Time" only if they were successful in EVERY week
    const allWeeksSuccessful = CHALLENGE_WEEKS.every(week => {
        const weekStats = getWeeklyStats(week.start, week.end, allLogs);
        return weekStats.isSuccessful;
    });

    return { isSuccessful: allWeeksSuccessful };
}

