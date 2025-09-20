import { useState } from 'react';
import { usePOS } from '@/hooks/usePOS';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Receipt } from '@/components/pos/Receipt';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Minus, Plus, Trash2, Receipt as ReceiptIcon, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function POSPage() {
  const {
    products,
    cart,
    addToCart,
    updateCartItemQuantity,
    updateCartItemDiscount,
    removeFromCart,
    clearCart,
    calculateItemTotal,
    calculateTotals,
    generateReceipt,
    loading,
    error,
    loadProducts
  } = usePOS();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentReceipt, setCurrentReceipt] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');


  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.stock > 0;
  });

  const categories = ['all', ...new Set(products.map((p) => p.category))];
  const totals = calculateTotals();

  // ✅ Checkout now waits for Supabase save
const handleCheckout = async () => {
  if (cart.length === 0) {
    toast({
      title: 'Empty Cart',
      description: 'Please add items to cart before checkout.',
      variant: 'destructive',
    });
    return;
  }

  try {
    const receipt = await generateReceipt(paymentMethod);
    setCurrentReceipt(receipt);
    clearCart();

    // ✅ Refresh products to show updated stock
    await loadProducts();

    toast({
      title: 'Transaction Complete',
      description: `Receipt #${receipt.id} saved successfully.`,
    });
  } catch (err: any) {
    console.error('Checkout error:', err);
    toast({
      title: 'Error',
      description: 'Failed to save receipt or update stock.',
      variant: 'destructive',
    });
  }
};


  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="pos-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Products</span>
                <Badge variant="outline">{filteredProducts.length} available</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products or scan barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="md:w-[200px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-primary">
                            ₱{product.price.toFixed(2)}
                          </span>
                          <Badge variant={product.stock < 10 ? 'destructive' : 'secondary'}>
                            {product.stock} left
                          </Badge>
                        </div>
                        <Button
                          onClick={() => addToCart(product)}
                          className="w-full pos-button"
                          size="sm"
                          disabled={product.stock === 0}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <Card className="pos-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Cart</span>
                <Badge>{cart.length} items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Cart is empty</p>
                  <p className="text-sm">Add products to start transaction</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <Card key={item.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-destructive h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-sm font-semibold">
                            ₱{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            placeholder="Discount %"
                            value={item.discount || ''}
                            onChange={(e) =>
                              updateCartItemDiscount(item.id, Number(e.target.value))
                            }
                            className="text-xs h-7"
                            min="0"
                            max="100"
                          />
                          <span className="text-xs text-muted-foreground">% off</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totals & Checkout */}
          {cart.length > 0 && (
            <Card className="pos-card">
             <CardContent className="p-4 space-y-3">
  <div className="space-y-2 text-sm">
    <div className="flex justify-between">
      <span>Subtotal:</span>
      <span>₱{totals.subtotal.toFixed(2)}</span>
    </div>
    <Separator />
    <div className="flex justify-between text-lg font-bold">
      <span>Total:</span>
      <span>₱{totals.total.toFixed(2)}</span>
    </div>
  </div>

  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="cash">Cash</SelectItem>
      <SelectItem value="gcash">GCash</SelectItem>
    </SelectContent>
  </Select>

  <div className="space-y-2">
    <Button onClick={handleCheckout} className="w-full pos-button">
      Complete Transaction
    </Button>
    <Button variant="outline" onClick={clearCart} className="w-full">
      Clear Cart
    </Button>
  </div>
</CardContent>

            </Card>
          )}

          {/* Receipt Dialog */}
          {currentReceipt && (
            <Dialog open={!!currentReceipt} onOpenChange={() => setCurrentReceipt(null)}>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <ReceiptIcon className="h-5 w-5" />
                    <span>Transaction Complete</span>
                  </DialogTitle>
                </DialogHeader>
                <Receipt
                  receipt={currentReceipt}
                  storeName="Acer Online Cashier"
                  storeAddress="Miramonte Park West Caloocan City"
                  storePhone="0999-3986-6490"
                  showActions={true}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
