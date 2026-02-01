import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const client = await db.connect();

    // Create Users Table if not exists, then ensure columns exist
    await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        email VARCHAR(255) PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'PARTICIPANT',
        password_hash TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Migration: Add role and password_hash if they don't exist
    try {
      await client.sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'PARTICIPANT'`;
      await client.sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`;
    } catch (e) {
      console.log('Columns might already exist', e);
    }

    // Create Challenges Table
    await client.sql`
      CREATE TABLE IF NOT EXISTS challenges (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        start_date VARCHAR(255) NOT NULL,
        end_date VARCHAR(255) NOT NULL,
        milestone_type VARCHAR(50) DEFAULT 'WEEK'
      );
    `;

    // Migration for existing table if it was simple
    try {
      await client.sql`ALTER TABLE challenges ADD COLUMN IF NOT EXISTS description TEXT`;
      await client.sql`ALTER TABLE challenges ADD COLUMN IF NOT EXISTS milestone_type VARCHAR(50) DEFAULT 'WEEK'`;
      // If label exists, rename or copy to name
      await client.sql`ALTER TABLE challenges RENAME COLUMN label TO name`;
    } catch (e) {
      console.log('Migration check for challenges', e);
    }

    // Create Challenge Activities Table
    await client.sql`
      CREATE TABLE IF NOT EXISTS challenge_activities (
        id SERIAL PRIMARY KEY,
        challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        required_amount NUMERIC NOT NULL,
        notes TEXT
      );
    `;

    // Create Activity Logs Table
    await client.sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id VARCHAR(255) PRIMARY KEY,
        user_email VARCHAR(255) REFERENCES users(email),
        challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
        activity_id INTEGER REFERENCES challenge_activities(id) ON DELETE CASCADE,
        date VARCHAR(255) NOT NULL,
        milestone_label VARCHAR(255),
        completed BOOLEAN DEFAULT FALSE,
        value NUMERIC,
        note TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_email, date, activity_id)
      );
    `;

    // Seed Admin User
    const adminEmail = 'admin@fitness.com';
    const password = 'admin-password'; // User should change this
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await client.sql`
      INSERT INTO users (email, first_name, last_name, role, password_hash)
      VALUES (${adminEmail}, 'System', 'Admin', 'ADMIN', ${passwordHash})
      ON CONFLICT (email) DO UPDATE SET
        role = 'ADMIN',
        password_hash = ${passwordHash}
    `;

    // Seed Initial Challenges
    const challengesData = [
      {
        name: 'Ramadan Resilience 2026',
        description: 'Prepare your body and soul for the holy month with consistent daily habits.',
        start_date: '2026-02-01',
        end_date: '2026-02-28',
        milestone_type: 'WEEK'
      }
    ];

    for (const c of challengesData) {
      const res = await client.sql`
        INSERT INTO challenges (name, description, start_date, end_date, milestone_type)
        VALUES (${c.name}, ${c.description}, ${c.start_date}, ${c.end_date}, ${c.milestone_type})
        RETURNING id
      `;
      const challengeId = res.rows[0].id;

      // Seed Activities for this challenge
      await client.sql`
        INSERT INTO challenge_activities (challenge_id, name, unit, required_amount, notes)
        VALUES 
          (${challengeId}, 'Daily Walk', 'miles', 3, 'Brisk walking for heart health'),
          (${challengeId}, 'Water Intake', 'liters', 2, 'Stay hydrated'),
          (${challengeId}, 'Workout', 'sessions', 1, 'Strength or cardio training'),
          (${challengeId}, 'Ramadan Prep', 'days', 1, 'Sunnah fasts or spiritual reading')
      `;
    }

    return NextResponse.json({ message: 'Database seeded successfully' }, { status: 200 });
  } catch (error) {
    console.error('Seed Error:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
