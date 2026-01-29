export interface User {
    email: string; // Identifier
    firstName: string;
    lastName: string;
    createdAt: string;
}

export type ActivityType = 'WALK' | 'WATER' | 'WORKOUT' | 'RAMADAN_PREP';

export interface ActivityLog {
    id: string;
    userEmail: string;
    date: string; // ISO Date String YYYY-MM-DD
    type: ActivityType;
    completed: boolean;
    note?: string;
    value?: number; // e.g. miles for walk, liters for water (if we want to track specific amounts later)
    timestamp: string;
}

export interface ProgressSummary {
    walkMiles: number; // Goal 5000
    waterLiters: number; // Daily goal 2L? or Total? Challenge says "2 liters of water" - seemingly daily.
    workouts: number;
    ramadanPrepDays: number;
}
