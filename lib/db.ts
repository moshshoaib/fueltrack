import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

function getSQL() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  return neon(process.env.DATABASE_URL)
}

export const sql = getSQL()
export const db = drizzle(sql)
