import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

interface RouteContext {
  params: Promise<{ id: string }>
}

// ✅ PATCH — update service
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params // 🔹 unwrap promise
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("services")
      .update({
        name: body.name,
        price: body.price,
      })
      .eq("id", id)
      .select()
      .maybeSingle() // 🔹 safer & cleaner

    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
  }
}

// ✅ DELETE — delete service
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params // 🔹 unwrap promise
    const supabase = await createClient()

    const { error } = await supabase.from("services").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
  }
}
