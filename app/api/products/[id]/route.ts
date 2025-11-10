import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

interface RouteContext {
  params: Promise<{ id: string }>
}

// ✅ PATCH — update product details
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params // unwrap the promise
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("products")
      .update({
        name: body.name,
        price: body.price,
        purchase_price: body.purchase_price,
        stock: body.stock,
      })
      .eq("id", id)
      .select()
      .maybeSingle() // ✅ safer than select()[0]

    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

// ✅ DELETE — remove a product
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params // unwrap promise
    const supabase = await createClient()

    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
