import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const totalAmount = body.items.reduce(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0
    )

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: body.customerName,
        customer_phone: body.customerPhone,
        vehicle_type: body.vehicleType,
        plate_number: body.plateNumber,
        complaint: body.complaint,
        total_amount: totalAmount,
        status: "Diproses",
      })
      .select()
      .maybeSingle()

    if (orderError || !orderData) throw orderError

    // Insert order items
    for (const item of body.items) {
      const { error: itemError } = await supabase.from("order_items").insert({
        order_id: orderData.id,
        item_id: item.itemId,
        item_name: item.itemName,
        item_type: item.itemType,
        quantity: item.quantity,
        price: item.price,
        purchase_price: item.purchase_price || 0,
        subtotal: item.price * item.quantity,
      })
      if (itemError) throw itemError

      // Update stock for products only
      if (item.itemType === "product") {
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("product_id", item.itemId)
          .maybeSingle()

        if (product) {
          const newStock = Math.max(0, (product.stock || 0) - item.quantity)
          await supabase.from("products").update({ stock: newStock }).eq("product_id", item.itemId)
        }
      }
    }

    return NextResponse.json(orderData, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
