import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", params.id).single()

    if (orderError) throw orderError

    const { data: items, error: itemsError } = await supabase.from("order_items").select("*").eq("order_id", params.id)

    if (itemsError) throw itemsError

    return NextResponse.json({ order, items })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase.from("orders").update({ status: body.status }).eq("id", params.id).select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
