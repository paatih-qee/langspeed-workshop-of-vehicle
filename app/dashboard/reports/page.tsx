"use client"
import "../../globals.css"
import { useRef, useState } from "react"
import { useReactToPrint } from "react-to-print"
import { useProfitLoss } from "@/lib/hooks/use-profit-loss"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Printer } from "lucide-react"

type ChartDatum = { name: string; value: number }

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const { report, isLoading } = useProfitLoss(startDate, endDate)

  // ref area laporan
  const reportRef = useRef<HTMLDivElement>(null)

  // useReactToPrint: hapus opsi yang tidak dikenali oleh tipe
  const handlePrint = useReactToPrint({
    contentRef: reportRef, // ✅ versi baru v3.x
    documentTitle: `Laporan Keuangan_${startDate}_${endDate}`,
    onAfterPrint: () => console.log("Laporan selesai dicetak"),
  })


  const handleReset = () => {
    setStartDate("")
    setEndDate("")
  }

  const isDateFilterComplete = Boolean(startDate && endDate)

  // akses property yang mungkin tidak ada pada tipe yang dikembalikan hook
  // gunakan casting ke any dengan fallback 0 agar TypeScript tidak error
  const totalRevenue = (report as any)?.totalRevenue ?? 0
  const totalCost = (report as any)?.totalCost ?? 0
  const totalProfit = (report as any)?.totalProfit ?? 0
  const productRevenue = (report as any)?.productRevenue ?? 0
  const serviceRevenue = (report as any)?.serviceRevenue ?? 0
  const profitMargin = (report as any)?.profitMargin ?? 0
  const itemsSold = (report as any)?.itemsSold ?? 0
  const orderCount = (report as any)?.orderCount ?? 0
  const period = (report as any)?.period ?? `${startDate} - ${endDate}`

  const chartData: ChartDatum[] = report
    ? [
        { name: "Pendapatan", value: Number(totalRevenue) },
        { name: "Biaya", value: Number(totalCost) },
        { name: "Laba", value: Number(totalProfit) },
      ]
    : []

  const revenueBreakdown: ChartDatum[] = report
    ? [
        { name: "Produk", value: Number(productRevenue) },
        { name: "Jasa", value: Number(serviceRevenue) },
      ]
    : []

  const COLORS = ["#3b82f6", "#ef4444", "#10b981"]
  const REVENUE_COLORS = ["#8b5cf6", "#f59e0b"]

  return (
    <div className="space-y-6">
      <div className="px-4">
        <h1 className="text-3xl font-bold text-gray-900">Laporan Keuangan</h1>
        <p className="text-gray-600 mt-2">Analisis laba dan rugi bisnis Anda</p>
      </div>

      {/* Filter Section */}
      <div className="px-4">
        <Card>
          <CardHeader>
            <CardTitle>Filter Laporan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap px">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleReset} variant="outline">
                  Reset
                </Button>
                <Button onClick={handlePrint} disabled={!isDateFilterComplete} className="gap-2">
                  <Printer className="w-4 h-4" />
                  Cetak Laporan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Area yang akan dicetak */}
      <div ref={reportRef}>
        {report && (
          <>
            {/* Header khusus untuk mode cetak */}
            <div className="hidden print:block text-center mt-6 mb-6 border-b border-gray-400 pb-4">
              <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan Langspeed</h1>
              <p className="text-sm text-gray-700 mt-1">
                Jl. Merdeka No. 123, Bandung, Jawa Barat, Indonesia
              </p>
              <p className="text-sm text-gray-700">Email: finance@langspeed.co.id</p>
              <div className="mt-2 text-xs text-gray-500 italic">
                Dicetak pada: {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 px-4 print:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Pendapatan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">Rp {Number(totalRevenue).toLocaleString("id-ID")}</div>
                  <p className="text-xs text-gray-500 mt-1">{itemsSold} item terjual</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Biaya</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">Rp {Number(totalCost).toLocaleString("id-ID")}</div>
                  <p className="text-xs text-gray-500 mt-1">Harga pokok penjualan</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Laba</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${Number(totalProfit) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    Rp {Number(totalProfit).toLocaleString("id-ID")}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Keuntungan bersih</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Margin Laba</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${Number(profitMargin) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {Number(profitMargin).toFixed(2)}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Persentase keuntungan</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 px-4">
              <Card>
                <CardHeader>
                  <CardTitle>Perbandingan Pendapatan, Biaya, dan Laba</CardTitle>
                  <CardDescription>Visualisasi ringkas keuangan</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => `Rp ${Number(value).toLocaleString("id-ID")}`} />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="hidden print:block">
                <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Distribusi Keuangan</CardTitle>
                  <CardDescription>Proporsi pendapatan, biaya, dan laba</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        // anotasi tipe parameter label agar TS tahu value adalah number
                        label={({ name, value }: { name: string; value: number }) => `${name}: Rp ${Number(value).toLocaleString("id-ID")}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `Rp ${Number(value).toLocaleString("id-ID")}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pendapatan Produk vs Jasa</CardTitle>
                  <CardDescription>Perbandingan sumber pendapatan</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={revenueBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }: { name: string; value: number }) => `${name}: Rp ${Number(value).toLocaleString("id-ID")}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {REVENUE_COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `Rp ${Number(value).toLocaleString("id-ID")}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Detail Section */}
            <div className="px-6">
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Detail Laporan</CardTitle>
                  <CardDescription>Periode: {period}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">Total Pendapatan:</span>
                      <span className="font-semibold">Rp {Number(totalRevenue).toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">Pendapatan dari Produk:</span>
                      <span className="font-semibold">Rp {Number(productRevenue).toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">Pendapatan dari Jasa:</span>
                      <span className="font-semibold">Rp {Number(serviceRevenue).toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">Total Biaya (HPP):</span>
                      <span className="font-semibold">Rp {Number(totalCost).toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">Total Laba Kotor:</span>
                      <span className="font-semibold text-green-600">
                        Rp {Number(totalRevenue - totalCost).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">Margin Laba:</span>
                      <span className="font-semibold">{Number(profitMargin).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Jumlah Pesanan:</span>
                      <span className="font-semibold">{orderCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {isLoading && <div className="text-center text-gray-500 mt-4">Memuat laporan...</div>}
      </div>
    </div>
  )
}
