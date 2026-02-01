"use server";

import { sql } from "@vercel/postgres";
import { User, ActivityLog, Challenge, ChallengeActivity } from "@/lib/types";
import { revalidatePath } from "next/cache";

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
      INSERT INTO users (email, first_name, last_name, role, created_at)
      VALUES (${user.email}, ${user.firstName}, ${user.lastName}, 'PARTICIPANT', ${new Date().toISOString()})
    `;
        return { success: true, user: { ...user, role: 'PARTICIPANT' } as User };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, error: "Database error" };
    }
}

export async function loginUser(email: string, password?: string) {
    try {
        const result = await sql`
      SELECT email, first_name as "firstName", last_name as "lastName", role, password_hash as "passwordHash", created_at as "createdAt"
      FROM users WHERE email = ${email}
    `;
        if (result.rows.length === 0) {
            return { success: false, error: "User not found" };
        }
        const user = result.rows[0] as User;

        if (user.role === 'ADMIN') {
            if (!password) {
                return { success: false, error: "Password required for admin" };
            }
            const bcrypt = require('bcryptjs');
            const isValid = await bcrypt.compare(password, user.passwordHash);
            if (!isValid) {
                return { success: false, error: "Invalid password" };
            }
        }

        return { success: true, user };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, error: "Database error" };
    }
}

// --- Admin Actions ---

export async function getUsers() {
    try {
        const result = await sql`
            SELECT email, first_name as "firstName", last_name as "lastName", role, created_at as "createdAt"
            FROM users
            ORDER BY created_at DESC
        `;
        return { success: true, users: result.rows as User[] };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, users: [] };
    }
}

export async function adminAddUser(user: Omit<User, 'createdAt' | 'passwordHash'> & { password?: string }) {
    try {
        const existing = await sql`SELECT email FROM users WHERE email = ${user.email}`;
        if (existing.rows.length > 0) {
            return { success: false, error: "User already exists" };
        }

        let passwordHash = null;
        if (user.password) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            passwordHash = await bcrypt.hash(user.password, salt);
        }

        await sql`
            INSERT INTO users (email, first_name, last_name, role, password_hash, created_at)
            VALUES (${user.email}, ${user.firstName}, ${user.lastName}, ${user.role}, ${passwordHash}, ${new Date().toISOString()})
        `;
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, error: "Failed to add user" };
    }
}

export async function updateUser(email: string, updates: Partial<Omit<User, 'email' | 'createdAt' | 'passwordHash'>> & { password?: string }) {
    try {
        if (updates.password) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(updates.password, salt);

            await sql`
                UPDATE users 
                SET first_name = COALESCE(${updates.firstName}, first_name),
                    last_name = COALESCE(${updates.lastName}, last_name),
                    role = COALESCE(${updates.role}, role),
                    password_hash = ${passwordHash}
                WHERE email = ${email}
            `;
        } else {
            await sql`
                UPDATE users 
                SET first_name = COALESCE(${updates.firstName}, first_name),
                    last_name = COALESCE(${updates.lastName}, last_name),
                    role = COALESCE(${updates.role}, role)
                WHERE email = ${email}
            `;
        }

        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, error: "Failed to update user" };
    }
}

export async function deleteUser(email: string) {
    try {
        await sql`DELETE FROM users WHERE email = ${email}`;
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, error: "Failed to delete user" };
    }
}

// --- Admin/Challenge Actions ---

export async function getChallenges() {
    try {
        const result = await sql`
            SELECT id, name, description, start_date as "startDate", end_date as "endDate", milestone_type as "milestoneType"
            FROM challenges
            ORDER BY start_date ASC
        `;

        const challenges = result.rows as Challenge[];

        // Fetch activities for each challenge
        for (const challenge of challenges) {
            const activitiesResult = await sql`
                SELECT id, challenge_id as "challengeId", name, unit, required_amount as "requiredAmount", notes
                FROM challenge_activities
                WHERE challenge_id = ${challenge.id}
            `;
            // @ts-ignore
            challenge.activities = activitiesResult.rows.map(row => ({
                ...row,
                requiredAmount: parseFloat(row.requiredAmount)
            }));
        }

        return { success: true, challenges };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, challenges: [] };
    }
}

export async function addComplexChallenge(challenge: Omit<Challenge, 'id' | 'activities'>, activities: Omit<ChallengeActivity, 'id' | 'challengeId'>[]) {
    try {
        // Insert challenge
        const challengeResult = await sql`
            INSERT INTO challenges (name, description, start_date, end_date, milestone_type)
            VALUES (${challenge.name}, ${challenge.description}, ${challenge.startDate}, ${challenge.endDate}, ${challenge.milestoneType})
            RETURNING id
        `;
        const challengeId = challengeResult.rows[0].id;

        // Insert activities
        for (const activity of activities) {
            await sql`
                INSERT INTO challenge_activities (challenge_id, name, unit, required_amount, notes)
                VALUES (${challengeId}, ${activity.name}, ${activity.unit}, ${activity.requiredAmount}, ${activity.notes})
            `;
        }

        revalidatePath("/admin/dashboard");
        revalidatePath("/dashboard");
        return { success: true, id: challengeId };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, error: "Failed to add challenge" };
    }
}

export async function deleteChallenge(id: number) {
    try {
        await sql`DELETE FROM challenges WHERE id = ${id}`;
        revalidatePath("/admin/dashboard");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, error: "Failed to delete challenge" };
    }
}

// --- Activity Actions ---

export async function logActivity(activity: ActivityLog) {
    try {
        await sql`
      INSERT INTO activity_logs (id, user_email, challenge_id, activity_id, date, milestone_label, completed, value, note, timestamp)
      VALUES (${activity.id}, ${activity.userEmail}, ${activity.challengeId}, ${activity.activityId}, ${activity.date}, ${activity.milestoneLabel}, ${activity.completed}, ${activity.value}, ${activity.note}, ${activity.timestamp})
      ON CONFLICT (user_email, date, activity_id) 
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
        const result = await sql`
      SELECT 
        id, 
        user_email as "userEmail", 
        challenge_id as "challengeId",
        activity_id as "activityId",
        date, 
        milestone_label as "milestoneLabel",
        completed, 
        value,
        note, 
        timestamp 
      FROM activity_logs 
      WHERE user_email = ${email}
      ORDER BY timestamp DESC
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
                    COUNT(a.id) as score,
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
                ORDER BY score DESC
                LIMIT 50
            `;
        } else {
            // Fallback "All Time" but typically we want range
            query = sql`
                SELECT 
                    u.first_name as "firstName", 
                    u.last_name as "lastName", 
                    u.email,
                    COUNT(a.id) as score,
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
                ORDER BY score DESC
                LIMIT 50
            `;
        }

        const result = await query;
        return { success: true, leaderboard: result.rows };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, leaderboard: [] };
    }
}
