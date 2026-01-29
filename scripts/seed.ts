import { db } from '@vercel/postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function seed() {
    try {
        console.log("Connecting to database...");
        const client = await db.connect();

        console.log("Creating Users table...");
        await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        email VARCHAR(255) PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

        console.log("Creating Activity Logs table...");
        await client.sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id VARCHAR(255) PRIMARY KEY,
        user_email VARCHAR(255) REFERENCES users(email),
        date VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        note TEXT,
        value NUMERIC,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

        console.log("Database seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

seed();
