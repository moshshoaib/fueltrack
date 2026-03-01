import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id

  const { searchParams } = new URL(request.url)
  const limit = searchParams.get("limit") || "50"
  const offset = searchParams.get("offset") || "0"
  const vehicleId = searchParams.get("vehicleId")

  try {
    let entries
    if (vehicleId) {
      entries = await sql`
        SELECT * FROM fuel_entries 
        WHERE user_id = ${userId} AND vehicle_id = ${vehicleId}
        ORDER BY date DESC, created_at DESC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `
    } else {
      entries = await sql`
        SELECT * FROM fuel_entries 
        WHERE user_id = ${userId}
        ORDER BY date DESC, created_at DESC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `
    }
    return NextResponse.json(entries)
  } catch (error) {
    console.error("Failed to fetch fuel entries:", error)
    return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id

  try {
    const body = await request.json()
    const { date, liters, price_per_liter, odometer, fuel_type, station, notes, vehicle_id } = body

    if (!date || !liters || !price_per_liter || !odometer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const total_cost = (parseFloat(liters) * parseFloat(price_per_liter)).toFixed(2)

    // Get the previous entry for THIS user and THIS vehicle to calculate distance and efficiency
    let previousEntries
    if (vehicle_id) {
      previousEntries = await sql`
        SELECT odometer FROM fuel_entries 
        WHERE user_id = ${userId} AND vehicle_id = ${vehicle_id}
          AND date <= ${date} 
          AND odometer < ${parseFloat(odometer)}
        ORDER BY odometer DESC LIMIT 1
      `
    } else {
      previousEntries = await sql`
        SELECT odometer FROM fuel_entries 
        WHERE user_id = ${userId} AND vehicle_id IS NULL
          AND date <= ${date} 
          AND odometer < ${parseFloat(odometer)}
        ORDER BY odometer DESC LIMIT 1
      `
    }

    let distance: number | null = null
    let fuel_efficiency: number | null = null
    let cost_per_km: number | null = null

    if (previousEntries.length > 0) {
      distance = parseFloat(odometer) - parseFloat(previousEntries[0].odometer)
      if (distance > 0) {
        fuel_efficiency = parseFloat((distance / parseFloat(liters)).toFixed(2))
        cost_per_km = parseFloat((parseFloat(total_cost) / distance).toFixed(4))
      }
    }

    const result = await sql`
      INSERT INTO fuel_entries (user_id, vehicle_id, date, liters, price_per_liter, total_cost, odometer, distance, fuel_efficiency, cost_per_km, fuel_type, station, notes)
      VALUES (${userId}, ${vehicle_id || null}, ${date}, ${parseFloat(liters)}, ${parseFloat(price_per_liter)}, ${parseFloat(total_cost)}, ${parseFloat(odometer)}, ${distance}, ${fuel_efficiency}, ${cost_per_km}, ${fuel_type || 'Petrol'}, ${station || null}, ${notes || null})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Failed to create fuel entry:", error)
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 })
  }
}
