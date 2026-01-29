import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await db.connect();

    // Create Users Table
    await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        email VARCHAR(255) PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create Activity Logs Table
    await client.sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id VARCHAR(255) PRIMARY KEY,
        user_email VARCHAR(255) REFERENCES users(email),
        date VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        note TEXT,
        value NUMERIC,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_email, date, type)
      );
    `;

    // UUID extension might be needed for uuid_generate_v4(), but let's stick to generating UUIDs in JS
    // and passing them as strings or using standard Postgres UUID if available.
    // Actually, good practice to enable it if possible, but for simplicity
    // I will just use text or relying on client-generated IDs for now to avoid extension permission issues
    // on some specialized postgres setups (though Vercel usually supports it).
    // Let's adjust the Create Table to store ID as text to be safe with the UUIDs we generate in app.

    // Correcting schema for ID to be safer
    await client.sql`
        ALTER TABLE activity_logs ALTER COLUMN id TYPE VARCHAR(255);
    `;

    return NextResponse.json({ message: 'Database seeded successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
