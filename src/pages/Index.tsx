import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { usePOS } from "@/hooks/usePOS"
import { Receipt } from "@/types/pos"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { ShoppingCart, Package, BarChart3, Clock, ArrowRight } from "lucide-react"

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts"

const Index = () => {
  const currentTime = new Date().toLocaleTimeString()
  const currentDate = new Date().toLocaleDateString()

  // Product data
  const { products, loading } = usePOS()
  const categories = Array.from(new Set(products.map((p) => p.category)))
  const totalProducts = products.length
  const lowStockProducts = products.filter((p) => p.stock < 10).length

  // Receipt & sales data
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [salesToday, setSalesToday] = useState(0)

  useEffect(() => {
    const fetchReceipts = async () => {
      const { data, error } = await supabase
        .from("receipts")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error && data) {
        const mapped = data.map((r) => ({
          id: r.id,
          items: r.items,
          subtotal: Number(r.subtotal),
          discount: Number(r.discount),
          tax: Number(r.tax),
          total: Number(r.total),
          paymentMethod: r.payment_method,
          timestamp: new Date(r.created_at),
          cashier: r.cashier,
        }))
        setReceipts(mapped)

        // Compute today's sales
        const today = new Date().toDateString()
        const todaySales = mapped
          .filter((r) => new Date(r.timestamp).toDateString() === today)
          .reduce((sum, r) => sum + r.total, 0)
        setSalesToday(todaySales)
      }
    }

    fetchReceipts()
  }, [])

  // Sales per day for chart
  const salesByDay = receipts.reduce((acc, r) => {
    const date = new Date(r.timestamp).toLocaleDateString()
    acc[date] = (acc[date] || 0) + r.total
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(salesByDay).map(([date, total]) => ({
    date,
    total,
  }))

  const quickActions = [
    {
      title: "Start New Transaction",
      description: "Begin cashier operations and process sales",
      icon: ShoppingCart,
      href: "/pos",
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "Manage Inventory",
      description: "Add, edit, or remove products from stock",
      icon: Package,
      href: "/products",
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "Check Receipts",
      description: "View past transactions and sales records",
      icon: BarChart3,
      href: "/receipts",
      color: "bg-accent text-accent-foreground",
    },
  ]

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Acer Online Cashier</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Overview of your POS system performance
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>
              {currentDate} - {currentTime}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.href} to={action.href}>
              <Card className="pos-card h-full hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardHeader className="pb-4">
                  <div
                    className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    {action.description}
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium">
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* System Status */}
      <Card className="pos-card mb-8">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {loading ? "..." : totalProducts}
              </div>
              <div className="text-sm text-muted-foreground">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pos-success">
                {loading ? "..." : categories.length}
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pos-warning">
                {loading ? "..." : lowStockProducts}
              </div>
              <div className="text-sm text-muted-foreground">Low Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{receipts.length}</div>
              <div className="text-sm text-muted-foreground">Total Receipts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                ₱{salesToday.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Today's Sales</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Chart */}
      <Card className="pos-card mb-8">
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-muted-foreground">No sales data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Index