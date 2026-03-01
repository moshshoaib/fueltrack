import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"

const env = readFileSync(".env.local", "utf8")
const dbUrl = env.match(/DATABASE_URL="(.+)"/)?.[1]

async function check() {
    const url = dbUrl || process.env.DATABASE_URL
    const sql = neon(url)

    try {
        console.log("Checking fuel_entries columns...")
        const cols = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'fuel_entries';
        `
        console.table(cols)

        console.log("Checking user table structure...")
        const userCols = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'user' OR table_name = 'users';
        `
        console.table(userCols)

        console.log("Checking vehicle table structure...")
        const vehicleCols = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'vehicle';
        `
        console.table(vehicleCols)
    } catch (err) {
        console.error(err)
    }
}

check()
