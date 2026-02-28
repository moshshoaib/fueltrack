import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

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
