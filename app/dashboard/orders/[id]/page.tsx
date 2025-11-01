"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

interface OrderItem {
  id: string
  item_name: string
  item_type: "product" | "service"
  quantity: number
  price: number
  purchase_price: number
  subtotal: number
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  vehicle_type: string
  plate_number: string
  complaint: string
  total_amount: number
  status: "Diproses" | "Selesai"
  created_at: string
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`)
        if (!response.ok) throw new Error("Failed to fetch order")

        const data = await response.json()
        setOrder(data.order)
        setItems(data.items)
      } catch (error) {
        toast.error("Gagal memuat detail pesanan")
        router.push("/dashboard/orders")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchOrderDetails()
    }
  }, [params.id, router])

  const handleStatusChange = async (newStatus: "Diproses" | "Selesai") => {
    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      const updatedOrder = await response.json()
      setOrder(updatedOrder)
      toast.success("Status pesanan berhasil diperbarui")
    } catch (error) {
      toast.error("Gagal memperbarui status")
    }
  }

  const groupedItems = items.reduce((acc, item) => {
    const existingItem = acc.find((i) => i.id === item.id)
    if (existingItem) {
      existingItem.quantity += item.quantity
    } else {
      acc.push({ ...item })
    }
    return acc
  }, [] as OrderItem[])

  const itemsWithCorrectSubtotal = groupedItems.map((item) => ({
    ...item,
    subtotal: item.price * item.quantity,
  }))

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>
  }

  if (!order) {
    return <div className="text-center text-gray-500">Pesanan tidak ditemukan</div>
  }

  const statusColor = order.status === "Selesai" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link href="/dashboard/orders" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4">
            <ArrowLeft size={16} />
            Kembali ke Riwayat Pesanan
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Detail Order Servis</h1>
          <p className="text-gray-600 mt-1">Order #{order.order_number}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informasi Order */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">No. Order</p>
              <p className="font-semibold text-gray-900">{order.order_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tanggal</p>
              <p className="font-semibold text-gray-900">
                {new Date(order.created_at).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
                {order.status}
              </span>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-blue-600">Rp {order.total_amount.toLocaleString("id-ID")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Informasi Pelanggan */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pelanggan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Nama</p>
              <p className="font-semibold text-gray-900">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Telepon</p>
              <p className="font-semibold text-gray-900">{order.customer_phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Kendaraan</p>
              <p className="font-semibold text-gray-900">{order.vehicle_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">No. Polisi</p>
              <p className="font-semibold text-gray-900">{order.plate_number}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keluhan */}
      <Card>
        <CardHeader>
          <CardTitle>Keluhan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-900">{order.complaint}</p>
        </CardContent>
      </Card>

      {/* Detail Item */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">NAMA ITEM</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">TIPE</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">JUMLAH</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">HARGA SATUAN</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                {itemsWithCorrectSubtotal.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{item.item_name}</td>
                    <td className="py-3 px-4 text-gray-900">
                      <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded">
                        {item.item_type === "product" ? "Produk" : "Jasa"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-900">{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-gray-900">Rp {item.price.toLocaleString("id-ID")}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={4} className="py-3 px-4 text-right text-gray-900">
                    TOTAL:
                  </td>
                  <td className="py-3 px-4 text-right text-blue-600">
                    Rp {order.total_amount.toLocaleString("id-ID")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Status Update */}
      <Card>
        <CardHeader>
          <CardTitle>Ubah Status</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value as "Diproses" | "Selesai")}
            className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
          </select>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .no-print {
            display: none;
          }
          .print-only {
            display: block;
          }
        }
      `}</style>
    </div>
  )
}
