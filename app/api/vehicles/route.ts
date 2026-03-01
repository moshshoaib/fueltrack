import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

export const dynamic = "force-dynamic"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // Note: Table name from Drizzle schema is "vehicle"
        const vehicles = await sql`
      SELECT * FROM vehicle 
      WHERE "userId" = ${session.user.id} 
      ORDER BY created_at DESC
    `
        return NextResponse.json(vehicles)
    } catch (error) {
        console.error("Failed to fetch vehicles:", error)
        return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { name, make, model, year, license_plate, icon } = body

        if (!name) {
            return NextResponse.json({ error: "Vehicle name is required" }, { status: 400 })
        }

        // Check if this is the first vehicle for this user
        const existingCount = await sql`
      SELECT count(*) as count FROM vehicle 
      WHERE "userId" = ${session.user.id}
    `
        const isDefault = parseInt(existingCount[0].count) === 0

        const id = crypto.randomUUID()

        const result = await sql`
      INSERT INTO vehicle (id, "userId", name, make, model, year, license_plate, is_default, icon)
      VALUES (
        ${id}, 
        ${session.user.id}, 
        ${name}, 
        ${make || null}, 
        ${model || null}, 
        ${year ? parseInt(year) : null}, 
        ${license_plate || null}, 
        ${isDefault},
        ${icon || 'car'}
      )
      RETURNING *
    `

        return NextResponse.json(result[0], { status: 201 })
    } catch (error) {
        console.error("Failed to create vehicle:", error)
        return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 })
    }
}
