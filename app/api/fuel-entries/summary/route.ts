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
  const period = searchParams.get("period") || "monthly"
  const vehicleId = searchParams.get("vehicleId")

  try {
    // Query 1: Basic totals for this user/vehicle
    const totalsResult = vehicleId
      ? await sql`
        SELECT 
          COUNT(*)::int as total_entries,
          COALESCE(SUM(liters), 0)::float as total_liters,
          COALESCE(SUM(total_cost), 0)::float as total_cost,
          COALESCE(SUM(distance), 0)::float as total_distance,
          COALESCE(AVG(price_per_liter), 0)::float as avg_price_per_liter
        FROM fuel_entries
        WHERE user_id = ${userId} AND vehicle_id = ${vehicleId}
      `
      : await sql`
        SELECT 
          COUNT(*)::int as total_entries,
          COALESCE(SUM(liters), 0)::float as total_liters,
          COALESCE(SUM(total_cost), 0)::float as total_cost,
          COALESCE(SUM(distance), 0)::float as total_distance,
          COALESCE(AVG(price_per_liter), 0)::float as avg_price_per_liter
        FROM fuel_entries
        WHERE user_id = ${userId}
      `;

    // Query 2: Efficiency stats for this user/vehicle
    const effResult = vehicleId
      ? await sql`
        SELECT 
          COALESCE(AVG(fuel_efficiency), 0)::float as avg_efficiency,
          COALESCE(AVG(cost_per_km), 0)::float as avg_cost_per_km,
          COALESCE(MAX(fuel_efficiency), 0)::float as best_efficiency,
          COALESCE(MIN(fuel_efficiency), 0)::float as worst_efficiency
        FROM fuel_entries
        WHERE user_id = ${userId} AND vehicle_id = ${vehicleId} AND fuel_efficiency IS NOT NULL
      `
      : await sql`
        SELECT 
          COALESCE(AVG(fuel_efficiency), 0)::float as avg_efficiency,
          COALESCE(AVG(cost_per_km), 0)::float as avg_cost_per_km,
          COALESCE(MAX(fuel_efficiency), 0)::float as best_efficiency,
          COALESCE(MIN(fuel_efficiency), 0)::float as worst_efficiency
        FROM fuel_entries
        WHERE user_id = ${userId} AND fuel_efficiency IS NOT NULL
      `;

    const summary = {
      total_entries: totalsResult[0]?.total_entries ?? 0,
      total_liters: totalsResult[0]?.total_liters ?? 0,
      total_cost: totalsResult[0]?.total_cost ?? 0,
      total_distance: totalsResult[0]?.total_distance ?? 0,
      avg_price_per_liter: totalsResult[0]?.avg_price_per_liter ?? 0,
      avg_efficiency: effResult[0]?.avg_efficiency ?? 0,
      avg_cost_per_km: effResult[0]?.avg_cost_per_km ?? 0,
      best_efficiency: effResult[0]?.best_efficiency ?? 0,
      worst_efficiency: effResult[0]?.worst_efficiency ?? 0,
    }

    // Period breakdown for this user/vehicle
    let periodData
    if (period === "daily") {
      periodData = vehicleId
        ? await sql`
          SELECT 
            TO_CHAR(date, 'YYYY-MM-DD') as period,
            COALESCE(SUM(liters), 0)::float as total_liters,
            COALESCE(SUM(total_cost), 0)::float as total_cost,
            COALESCE(SUM(distance), 0)::float as total_distance,
            AVG(fuel_efficiency)::float as avg_efficiency,
            COUNT(*)::int as entries_count
          FROM fuel_entries
          WHERE user_id = ${userId} AND vehicle_id = ${vehicleId}
          GROUP BY date, TO_CHAR(date, 'YYYY-MM-DD')
          ORDER BY period DESC
          LIMIT 30
        `
        : await sql`
          SELECT 
            TO_CHAR(date, 'YYYY-MM-DD') as period,
            COALESCE(SUM(liters), 0)::float as total_liters,
            COALESCE(SUM(total_cost), 0)::float as total_cost,
            COALESCE(SUM(distance), 0)::float as total_distance,
            AVG(fuel_efficiency)::float as avg_efficiency,
            COUNT(*)::int as entries_count
          FROM fuel_entries
          WHERE user_id = ${userId}
          GROUP BY date, TO_CHAR(date, 'YYYY-MM-DD')
          ORDER BY period DESC
          LIMIT 30
        `
    } else if (period === "yearly") {
      periodData = vehicleId
        ? await sql`
          SELECT 
            TO_CHAR(date, 'YYYY') as period,
            COALESCE(SUM(liters), 0)::float as total_liters,
            COALESCE(SUM(total_cost), 0)::float as total_cost,
            COALESCE(SUM(distance), 0)::float as total_distance,
            AVG(fuel_efficiency)::float as avg_efficiency,
            COUNT(*)::int as entries_count
          FROM fuel_entries
          WHERE user_id = ${userId} AND vehicle_id = ${vehicleId}
          GROUP BY TO_CHAR(date, 'YYYY')
          ORDER BY period DESC
          LIMIT 10
        `
        : await sql`
          SELECT 
            TO_CHAR(date, 'YYYY') as period,
            COALESCE(SUM(liters), 0)::float as total_liters,
            COALESCE(SUM(total_cost), 0)::float as total_cost,
            COALESCE(SUM(distance), 0)::float as total_distance,
            AVG(fuel_efficiency)::float as avg_efficiency,
            COUNT(*)::int as entries_count
          FROM fuel_entries
          WHERE user_id = ${userId}
          GROUP BY TO_CHAR(date, 'YYYY')
          ORDER BY period DESC
          LIMIT 10
        `
    } else {
      periodData = vehicleId
        ? await sql`
          SELECT 
            TO_CHAR(date, 'YYYY-MM') as period,
            COALESCE(SUM(liters), 0)::float as total_liters,
            COALESCE(SUM(total_cost), 0)::float as total_cost,
            COALESCE(SUM(distance), 0)::float as total_distance,
            AVG(fuel_efficiency)::float as avg_efficiency,
            COUNT(*)::int as entries_count
          FROM fuel_entries
          WHERE user_id = ${userId} AND vehicle_id = ${vehicleId}
          GROUP BY TO_CHAR(date, 'YYYY-MM')
          ORDER BY period DESC
          LIMIT 12
        `
        : await sql`
          SELECT 
            TO_CHAR(date, 'YYYY-MM') as period,
            COALESCE(SUM(liters), 0)::float as total_liters,
            COALESCE(SUM(total_cost), 0)::float as total_cost,
            COALESCE(SUM(distance), 0)::float as total_distance,
            AVG(fuel_efficiency)::float as avg_efficiency,
            COUNT(*)::int as entries_count
          FROM fuel_entries
          WHERE user_id = ${userId}
          GROUP BY TO_CHAR(date, 'YYYY-MM')
          ORDER BY period DESC
          LIMIT 12
        `
    }

    return NextResponse.json({ summary, periodData })
  } catch (error) {
    console.error("Failed to fetch summary:", error)
    return NextResponse.json(
      {
        summary: {
          total_entries: 0, total_liters: 0, total_cost: 0, total_distance: 0,
          avg_price_per_liter: 0, avg_efficiency: 0, avg_cost_per_km: 0,
          best_efficiency: 0, worst_efficiency: 0,
        },
        periodData: [],
      },
      { status: 200 }
    )
  }
}
