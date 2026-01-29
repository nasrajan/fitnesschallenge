"use server";

import { sql } from "@vercel/postgres";
import { User, ActivityLog, ActivityType } from "@/lib/types";
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
      INSERT INTO users (email, first_name, last_name, created_at)
      VALUES (${user.email}, ${user.firstName}, ${user.lastName}, ${new Date().toISOString()})
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
      VALUES (${activity.id}, ${activity.userEmail}, ${activity.date}, ${activity.type}, ${activity.completed}, ${activity.note}, ${activity.value}, ${activity.timestamp})
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
