import { db } from '@vercel/postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  try {
    const client = await db.connect();
    console.log("Adding unique constraint to activity_logs...");
    // We might have duplicates already, so we should clean them first or just try to add it.
    // To be safe, let's delete duplicates keeping the latest one.
    await client.sql`
      DELETE FROM activity_logs a USING activity_logs b
      WHERE a.id < b.id 
      AND a.user_email = b.user_email 
      AND a.date = b.date 
      AND a.type = b.type;
    `;
    await client.sql`
      ALTER TABLE activity_logs ADD CONSTRAINT unique_user_date_type UNIQUE (user_email, date, type);
    `;
    console.log("Constraint added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}
run();
