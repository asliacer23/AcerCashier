import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Receipt } from "@/types/pos"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)

useEffect(() => {
  const fetchReceipts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("receipts")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) {
      // ✅ Map snake_case → camelCase
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
    } else {
      console.error("Error fetching receipts:", error)
    }
    setLoading(false)
  }

  fetchReceipts()
}, [])


  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Receipts / Orders</h1>

      {loading ? (
        <p>Loading...</p>
      ) : receipts.length === 0 ? (
        <p className="text-muted-foreground">No receipts found.</p>
      ) : (
        <div className="space-y-4">
          {receipts.map((receipt) => (
            <Card key={receipt.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Receipt #{receipt.id}</span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(receipt.timestamp), "PPpp")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {receipt.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}

                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>₱{receipt.total.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Paid via {receipt.paymentMethod}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
