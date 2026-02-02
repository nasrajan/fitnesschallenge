"use server";

import { sql } from "@vercel/postgres";
import { User, ActivityLog, ActivityType } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { sanitizeInput } from "@/lib/utils";

// --- User Actions ---

export async function registerUser(user: User) {
    try {
        // Check if user exists
        const existing = await sql`
      SELECT * FROM users WHERE email = ${user.email}
    `;
        if (existing.rows.length > 0) {
            return { success: false, error: "User already exists" };
        }

        await sql`
      INSERT INTO users (email, first_name, last_name, created_at)
      VALUES (${user.email}, ${sanitizeInput(user.firstName)}, ${sanitizeInput(user.lastName)}, ${new Date().toISOString()})
    `;
        return { success: true, user };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, error: "Database error" };
    }
}

export async function loginUser(email: string) {
    try {
        const result = await sql`
      SELECT email, first_name as "firstName", last_name as "lastName", created_at as "createdAt"
      FROM users WHERE email = ${email}
    `;
        if (result.rows.length === 0) {
            return { success: false, error: "User not found" };
        }
        const user = result.rows[0] as User;
        return { success: true, user };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, error: "Database error" };
    }
}

// --- Activity Actions ---

export async function logActivity(activity: ActivityLog) {
    try {
        await sql`
      INSERT INTO activity_logs (id, user_email, date, type, completed, note, value, timestamp)
      VALUES (${activity.id}, ${activity.userEmail}, ${activity.date}, ${activity.type}, ${activity.completed}, ${sanitizeInput(activity.note || "")}, ${activity.value}, ${activity.timestamp})
      ON CONFLICT (user_email, date, type) 
      DO UPDATE SET 
        completed = EXCLUDED.completed,
        note = EXCLUDED.note,
        value = EXCLUDED.value,
        timestamp = EXCLUDED.timestamp
    `;
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, error: "Failed to log activity" };
    }
}

export async function getActivityLogs(email: string) {
    try {
        // noStore() might be needed if we want opting out of cache, 
        // but Server Components are cached by default. 
        // For now, simple query.
        const result = await sql`
      SELECT 
        id, 
        user_email as "userEmail", 
        date, 
        type, 
        completed, 
        note, 
        value, 
        timestamp 
      FROM activity_logs 
      WHERE user_email = ${email}
      ORDER BY timestamp DESC
    `;

        // Cast rows to match our type slightly - Postgres return lowercase usually, but clean up types
        const activities = result.rows.map(row => ({
            ...row,
            value: row.value ? parseFloat(row.value) : undefined
        })) as ActivityLog[];

        return { success: true, activities };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, activities: [] }; // Return empty list rather than exploding
    }
}

export async function getActivityLogsByDate(email: string, date: string) {
    try {
        const result = await sql`
      SELECT 
        id, 
        user_email as "userEmail", 
        date, 
        type, 
        completed, 
        note, 
        value, 
        timestamp 
      FROM activity_logs 
      WHERE user_email = ${email} AND date = ${date}
    `;

        const activities = result.rows.map(row => ({
            ...row,
            value: row.value ? parseFloat(row.value) : undefined
        })) as ActivityLog[];

        return { success: true, activities };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, activities: [] };
    }
}

export async function getLeaderboard(startDate?: string, endDate?: string) {
    try {
        let query;
        if (startDate && endDate) {
            // Use aggregation to get logs array. 
            // Note: date logic is string based 'YYYY-MM-DD'.
            query = sql`
                SELECT 
                    u.first_name as "firstName", 
                    u.last_name as "lastName", 
                    u.email,
                    COALESCE(
                        JSON_AGG(
                            json_build_object(
                                'type', a.type, 
                                'date', a.date, 
                                'completed', a.completed
                            )
                        ) FILTER (WHERE a.id IS NOT NULL), 
                        '[]'
                    ) as logs
                FROM users u
                LEFT JOIN activity_logs a ON u.email = a.user_email 
                    AND a.date >= ${startDate} AND a.date <= ${endDate} 
                    AND a.completed = TRUE
                GROUP BY u.email, u.first_name, u.last_name
                LIMIT 50
            `;
        } else {
            // Fallback "All Time" but typically we want range
            query = sql`
                SELECT 
                    u.first_name as "firstName", 
                    u.last_name as "lastName", 
                    u.email,
                    COALESCE(
                         JSON_AGG(
                            json_build_object(
                                'type', a.type, 
                                'date', a.date, 
                                'completed', a.completed
                            )
                        ) FILTER (WHERE a.id IS NOT NULL), 
                        '[]'
                    ) as logs
                FROM users u
                LEFT JOIN activity_logs a ON u.email = a.user_email AND a.completed = TRUE
                GROUP BY u.email, u.first_name, u.last_name
                LIMIT 50
            `;
        }

        const result = await query;

        // Calculate capped scores for each user
        // Workouts: max 3 days, Others (Walk, Water, Ramadan Prep): max 5 days each
        const leaderboardWithScores = result.rows.map((row) => {
            const logs = Array.isArray(row.logs) ? row.logs : [];

            // Group by activity type and count unique days
            const activityDays = {
                WALK: new Set<string>(),
                WATER: new Set<string>(),
                WORKOUT: new Set<string>(),
                RAMADAN_PREP: new Set<string>()
            };

            logs.forEach((log: any) => {
                if (log.completed && log.type && log.date) {
                    const set = activityDays[log.type as keyof typeof activityDays];
                    if (set) {
                        set.add(log.date);
                    }
                }
            });

            // Apply caps: Workout max 3, others max 5
            const cappedScore =
                Math.min(activityDays.WORKOUT.size, 3) +
                Math.min(activityDays.WALK.size, 5) +
                Math.min(activityDays.WATER.size, 5) +
                Math.min(activityDays.RAMADAN_PREP.size, 5);

            return {
                ...row,
                score: cappedScore,
                logs
            };
        });

        // Sort by capped score
        leaderboardWithScores.sort((a, b) => b.score - a.score);

        // Add ranking logic (dense ranking - consecutive ranks for ties)
        let currentRank = 0;
        let lastScore = -1;
        const leaderboard = leaderboardWithScores.map((row) => {
            if (row.score !== lastScore) {
                currentRank++;
                lastScore = row.score;
            }
            return {
                ...row,
                rank: currentRank
            };
        });

        return { success: true, leaderboard };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, leaderboard: [] };
    }
}
