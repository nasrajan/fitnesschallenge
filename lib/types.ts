export type UserRole = 'PARTICIPANT' | 'ORGANIZER' | 'ADMIN';

export interface User {
    email: string; // Identifier
    firstName: string;
    lastName: string;
    role: UserRole;
    passwordHash?: string;
    createdAt: string;
}

export interface ActivityLog {
    id: string;
    userEmail: string;
    challengeId: number;
    activityId: number;
    date: string; // ISO Date String YYYY-MM-DD
    milestoneLabel?: string;
    completed: boolean;
    note?: string;
    value?: number;
    timestamp: string;
}

export type MilestoneType = 'DAY' | 'WEEK' | 'MONTH';

export interface ChallengeActivity {
    id: number;
    challengeId: number;
    name: string;
    unit: string;
    requiredAmount: number;
    notes?: string;
}

export interface Challenge {
    id: any; // Can be string (v2) or number (v1)
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    milestoneType?: MilestoneType; // V1 only
    loggingFrequency?: FrequencyV2; // V2 only
    scoringFrequency?: FrequencyV2; // V2 only
    activities?: ChallengeActivity[]; // V1 only
    metrics?: MetricV2[]; // V2 only
}

// V2 Specific Types
export type FrequencyV2 = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type AggregationMethodV2 = 'SUM' | 'COUNT' | 'MAX' | 'LAST';

export interface ScoringRuleV2 {
    id?: string;
    thresholdMin: number;
    thresholdMax?: number | null;
    points: number;
    priority: number;
}

export interface MetricV2 {
    id?: string;
    name: string;
    unit: string;
    aggregationMethod: AggregationMethodV2;
    scoringRules: ScoringRuleV2[];
}
