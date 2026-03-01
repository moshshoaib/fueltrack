import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"

const env = readFileSync(".env.local", "utf8")
const dbUrl = env.match(/DATABASE_URL="(.+)"/)?.[1]

async function migrate() {
    const url = dbUrl || process.env.DATABASE_URL
    if (!url) {
        console.error("DATABASE_URL is not set")
        return
    }
    const sql = neon(url)

    try {
        console.log("Creating vehicle table...")
        await sql(`
            CREATE TABLE IF NOT EXISTS vehicle (
                id TEXT PRIMARY KEY,
                "userId" TEXT NOT NULL,
                name TEXT NOT NULL,
                make TEXT,
                model TEXT,
                year INTEGER,
                license_plate TEXT,
                is_default BOOLEAN DEFAULT false,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `)

        console.log("Adding vehicle_id column to fuel_entries...")
        await sql(`
            ALTER TABLE fuel_entries ADD COLUMN IF NOT EXISTS vehicle_id TEXT;
        `)

        console.log("Migration complete!")
    } catch (err) {
        console.error("Migration failed:", err)
    }
}

migrate()
