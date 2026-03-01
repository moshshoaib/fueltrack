import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id
  const { id } = await params

  try {
    const body = await request.json()
    const { date, liters, price_per_liter, odometer, fuel_type, station, notes, vehicle_id } = body

    if (!date || !liters || !price_per_liter || !odometer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const total_cost = (parseFloat(liters) * parseFloat(price_per_liter)).toFixed(2)

    // Recalculate distance and efficiency based on the NEW data
    // Find the previous entry for this user
    // Find the previous entry for this user and vehicle
    let previousEntries
    if (vehicle_id !== undefined && vehicle_id !== null) {
      previousEntries = await sql`
        SELECT odometer FROM fuel_entries 
        WHERE user_id = ${userId} AND vehicle_id = ${vehicle_id}
          AND (date < ${date} OR (date = ${date} AND id < ${parseInt(id)}))
        ORDER BY date DESC, odometer DESC LIMIT 1
      `
    } else {
      previousEntries = await sql`
        SELECT odometer FROM fuel_entries 
        WHERE user_id = ${userId} AND vehicle_id IS NULL
          AND (date < ${date} OR (date = ${date} AND id < ${parseInt(id)}))
        ORDER BY date DESC, odometer DESC LIMIT 1
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

    // Update the entry
    const result = await sql`
      UPDATE fuel_entries 
      SET 
        date = ${date}, 
        liters = ${parseFloat(liters)}, 
        price_per_liter = ${parseFloat(price_per_liter)}, 
        total_cost = ${parseFloat(total_cost)}, 
        odometer = ${parseFloat(odometer)}, 
        distance = ${distance}, 
        fuel_efficiency = ${fuel_efficiency}, 
        cost_per_km = ${cost_per_km}, 
        fuel_type = ${fuel_type || 'Petrol'}, 
        station = ${station || null}, 
        notes = ${notes || null},
        vehicle_id = ${vehicle_id !== undefined ? vehicle_id : sql`vehicle_id`}
      WHERE id = ${parseInt(id)} AND user_id = ${userId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Failed to update fuel entry:", error)
    return NextResponse.json({ error: "Failed to update entry" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id
  const { id } = await params

  try {
    // Only delete if the entry belongs to this user
    await sql`DELETE FROM fuel_entries WHERE id = ${parseInt(id)} AND user_id = ${userId}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete fuel entry:", error)
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 })
  }
}
