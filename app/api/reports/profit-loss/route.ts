import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

interface ProfitLossReport {
  period: string
  totalRevenue: number
  totalCost: number
  totalProfit: number
  profitMargin: number
  orderCount: number
  itemsSold: number
  productRevenue: number
  serviceRevenue: number
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // ✅ Base query
    let query = supabase
      .from("order_items")
      .select("price, purchase_price, quantity, item_type, created_at")

    // ✅ Add optional filters (date range)
    if (startDate) query = query.gte("created_at", startDate)
    if (endDate) query = query.lte("created_at", endDate)

    const { data: orderItems, error } = await query

    if (error) throw error
    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({
        message: "No data found for the selected period",
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        profitMargin: 0,
        orderCount: 0,
        itemsSold: 0,
        productRevenue: 0,
        serviceRevenue: 0,
      })
    }

    // ✅ Initialize totals
    let totalRevenue = 0
    let totalCost = 0
    let itemsSold = 0
    let productRevenue = 0
    let serviceRevenue = 0

    // ✅ Aggregate
    for (const item of orderItems) {
      const price = Number(item.price) || 0
      const qty = Number(item.quantity) || 0
      const purchasePrice = Number(item.purchase_price) || 0
      const revenue = price * qty

      totalRevenue += revenue
      itemsSold += qty

      if (item.item_type === "product") {
        totalCost += purchasePrice * qty
        productRevenue += revenue
      } else if (item.item_type === "service") {
        serviceRevenue += revenue
      }
    }

    // ✅ Compute summary
    const totalProfit = totalRevenue - totalCost
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

    const report: ProfitLossReport = {
      period: `${startDate || "All"} → ${endDate || "Now"}`,
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin: Math.round(profitMargin * 100) / 100,
      orderCount: orderItems.length,
      itemsSold,
      productRevenue,
      serviceRevenue,
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Error generating profit/loss report:", error)
    return NextResponse.json({ error: "Failed to generate profit/loss report" }, { status: 500 })
  }
}
