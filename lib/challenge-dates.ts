import { ActivityLog, Challenge } from "./types";
import { getChallenges } from "@/app/actions";

export async function getActiveChallenges(): Promise<Challenge[]> {
    const res = await getChallenges();
    return res.success ? res.challenges || [] : [];
}

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

export interface Milestone {
    label: string;
    startDate: string;
    endDate: string;
}

export function calculateMilestones(challenge: Challenge): Milestone[] {
    const milestones: Milestone[] = [];
    const start = new Date(challenge.startDate);
    const end = new Date(challenge.endDate);

    let current = new Date(start);
    let count = 1;

    while (current <= end) {
        let milestoneEnd = new Date(current);

        if (challenge.milestoneType === 'DAY') {
            milestoneEnd.setDate(current.getDate());
        } else if (challenge.milestoneType === 'WEEK') {
            milestoneEnd.setDate(current.getDate() + 6);
        } else if (challenge.milestoneType === 'MONTH') {
            milestoneEnd.setMonth(current.getMonth() + 1);
            milestoneEnd.setDate(0); // Last day of previous month
        }

        if (milestoneEnd > end) milestoneEnd = new Date(end);

        milestones.push({
            label: `${challenge.milestoneType === 'DAY' ? 'Day' : challenge.milestoneType === 'WEEK' ? 'Week' : 'Month'} ${count}`,
            startDate: current.toISOString().split('T')[0],
            endDate: milestoneEnd.toISOString().split('T')[0]
        });

        current = new Date(milestoneEnd);
        current.setDate(milestoneEnd.getDate() + 1);
        count++;
    }

    return milestones;
}

export function getDailyStatus(date: string, logs: ActivityLog[], activities: any[]): DayStatus {
    const dayLogs = logs.filter(l => l.date === date && l.completed);
    if (dayLogs.length === 0) return 'grey';

    // If all required activities for the day have at least one completed log
    const completedActivityIds = new Set(dayLogs.map(l => l.activityId));
    if (completedActivityIds.size >= activities.length) return 'green';

    return 'yellow';
}

