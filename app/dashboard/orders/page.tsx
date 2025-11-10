"use client"

import type React from "react"
import { useRouter } from "next/navigation"

import { useState } from "react"
import { useOrders } from "@/lib/hooks/use-orders"
import { useProducts } from "@/lib/hooks/use-products"
import { useServices } from "@/lib/hooks/use-services"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface OrderItem {
  itemId: string
  itemName: string
  itemType: "product" | "service"
  quantity: number
  price: number
  purchase_price: number
}

export default function OrdersPage() {
  const router = useRouter()
  const { orders, mutate: mutateOrders } = useOrders()
  const { products } = useProducts()
  const { services } = useServices()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<"product" | "service">("product")
  const [selectedItem, setSelectedItem] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [items, setItems] = useState<any[]>([])
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    vehicleType: "",
    plateNumber: "",
    complaint: "",
  })
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleAddItem = () => {
    if (!selectedItem || !quantity) {
      toast.error("Pilih item dan masukkan kuantitas")
      return
    }

    const qty = Number.parseInt(quantity)
    if (qty <= 0) {
      toast.error("Kuantitas harus lebih dari 0")
      return
    }

    let item: any
    if (selectedType === "product") {
      item = products.find((p) => p.id === selectedItem)
      if (!item || item.stock === 0) {
        toast.error("Produk tidak tersedia")
        return
      }
      if (qty > item.stock) {
        toast.error(`Stok tidak cukup. Stok tersedia: ${item.stock}`)
        return
      }
    } else {
      item = services.find((s) => s.id === selectedItem)
    }

    if (!item) {
      toast.error("Item tidak ditemukan")
      return
    }

    const newItem: OrderItem = {
      itemId: item.id,
      itemName: item.name,
      itemType: selectedType,
      quantity: qty,
      price: item.price,
      purchase_price: item.purchase_price || 0,
    }

    setItems([...items, newItem])
    setSelectedItem("")
    setQuantity("1")
    toast.success(`${item.name} ditambahkan ke pesanan`)
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast.error("Tambahkan minimal satu item")
      return
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items,
        }),
      })

      if (!response.ok) throw new Error("Failed to create order")

      toast.success("Pesanan berhasil dibuat")
      setFormData({
        customerName: "",
        customerPhone: "",
        vehicleType: "",
        plateNumber: "",
        complaint: "",
      })
      setItems([])
      setIsModalOpen(false)
      mutateOrders()
    } catch (error) {
      toast.error("Gagal membuat pesanan")
    }
  }

  const handleViewDetail = (order: any) => {
    router.push(`/dashboard/orders/${order.id}`)
  }

  const handleViewInvoice = (order: any) => {
    router.push(`/dashboard/orders/${order.id}/invoice`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pesanan</h1>
          <p className="text-gray-600 mt-2">Kelola pesanan servis dan penjualan</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              Pesanan Baru
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Buat Pesanan Baru</DialogTitle>
              <DialogDescription>Masukkan detail pesanan dan pilih item</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateOrder} className="space-y-4 max-h-[80vh] overflow-y-auto">
              {/* === Informasi Pelanggan === */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pelanggan</label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="customerPhone">No. Telepon</label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="vehicleType">Tipe Kendaraan</label>
                  <Input
                    id="vehicleType"
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="plateNumber">Plat Nomor</label>
                  <Input
                    id="plateNumber"
                    value={formData.plateNumber}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* === Keluhan === */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keluhan</label>
                <textarea
                  id="complaint"
                  value={formData.complaint}
                  onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              {/* === Tambahkan Item === */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Tambahkan Item</h3>

                <div className={`grid ${selectedType === "service" ? "grid-cols-2" : "grid-cols-3"} gap-2`}>
                  {/* Pilih tipe item */}
                  <div>
                    <label>Tipe</label>
                    <select
                      value={selectedType}
                      onChange={(e) => {
                        setSelectedType(e.target.value as "product" | "service")
                        setSelectedItem("")
                        setQuantity("1") // reset quantity tiap ganti tipe
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="product">Produk</option>
                      <option value="service">Jasa</option>
                    </select>
                  </div>

                  {/* Pilih item */}
                  <div>
                    <label>Item</label>
                    <select
                      value={selectedItem}
                      onChange={(e) => setSelectedItem(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Pilih item</option>
                      {selectedType === "product"
                        ? products.map((product) => (
                            <option
                              key={product.id}
                              value={product.id}
                              disabled={product.stock === 0}
                              className={product.stock === 0 ? "text-gray-400" : ""}
                            >
                              {product.name} (Stok: {product.stock})
                            </option>
                          ))
                        : services.map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.name}
                            </option>
                          ))}
                    </select>
                  </div>

                  {/* Input kuantitas hanya jika tipe = product */}
                  {selectedType === "product" && (
                    <div>
                      <label>Kuantitas</label>
                      <Input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleAddItem}
                  variant="secondary"
                  className="mt-3 w-full"
                  disabled={!selectedItem}
                >
                  Tambahkan Item
                </Button>
              </div>

              {/* === Daftar Item === */}
              <div>
                <h3 className="font-semibold mb-2">Item Pesanan ({items.length})</h3>
                {items.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded border"
                      >
                        <span>
                          {item.itemName}{" "}
                          {item.itemType === "product" && (
                            <>x{item.quantity}</>
                          )}{" "}
                          = Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Belum ada item ditambahkan</p>
                )}
              </div>

              {/* === Submit Button === */}
              <Button type="submit" className="w-full">
                Buat Pesanan
              </Button>
            </form>
          </DialogContent>
        </Dialog>

      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan</CardTitle>
          <CardDescription>Total {orders.length} pesanan</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center text-gray-500">Belum ada pesanan</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-semibold">No. Pesanan</th>
                    <th className="text-left py-2 px-4 font-semibold">Pelanggan</th>
                    <th className="text-left py-2 px-4 font-semibold">Kendaraan</th>
                    <th className="text-left py-2 px-4 font-semibold">Total</th>
                    <th className="text-left py-2 px-4 font-semibold">Status</th>
                    <th className="text-left py-2 px-4 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 font-semibold">{order.order_number}</td>
                      <td className="py-2 px-4">{order.customer_name}</td>
                      <td className="py-2 px-4">{order.vehicle_type}</td>
                      <td className="py-2 px-4">Rp {order.total_amount.toLocaleString("id-ID")}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            order.status === "Selesai" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewDetail(order)}>
                            Lihat Detail
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleViewInvoice(order)}>
                            Lihat Nota
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Pesanan</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">No. Pesanan</p>
                  <p className="font-semibold">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal</p>
                  <p className="font-semibold">{new Date(selectedOrder.created_at).toLocaleDateString("id-ID")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nama Pelanggan</p>
                  <p className="font-semibold">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telepon</p>
                  <p className="font-semibold">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipe Kendaraan</p>
                  <p className="font-semibold">{selectedOrder.vehicle_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plat Nomor</p>
                  <p className="font-semibold">{selectedOrder.plate_number}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Keluhan</p>
                <p className="font-semibold">{selectedOrder.complaint}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold">{selectedOrder.status}</p>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  Rp {selectedOrder.total_amount.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
