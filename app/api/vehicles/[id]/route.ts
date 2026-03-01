import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: vehicleId } = await params
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

        const result = await sql`
            UPDATE vehicle 
            SET 
                name = ${name}, 
                make = ${make || null}, 
                model = ${model || null}, 
                year = ${year ? parseInt(year) : null}, 
                license_plate = ${license_plate || null},
                icon = ${icon || 'car'}
            WHERE id = ${vehicleId} AND "userId" = ${session.user.id}
            RETURNING *
        `

        if (result.length === 0) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
        }

        return NextResponse.json(result[0])
    } catch (error) {
        console.error("Failed to update vehicle:", error)
        return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: vehicleId } = await params
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const result = await sql`
            DELETE FROM vehicle 
            WHERE id = ${vehicleId} AND "userId" = ${session.user.id}
            RETURNING *
        `

        if (result.length === 0) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "Vehicle deleted successfully" })
    } catch (error) {
        console.error("Failed to delete vehicle:", error)
        return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 })
    }
}
