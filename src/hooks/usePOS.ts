import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { Product, CartItem, Receipt } from '@/types/pos'

// Fetch all products
const fetchProducts = async () => {
  const { data, error } = await supabase.from('products').select('*')
  if (error) throw error
  return data
}

// Add product
const addProduct = async (product: Omit<Product, 'id'>) => {
  const { data, error } = await supabase.from('products').insert([product]).select()
  if (error) throw error
  return data?.[0]
}

// Update product
const updateProduct = async (id: string, updates: Partial<Product>) => {
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select()
  if (error) throw error
  return data?.[0]
}

// Delete product
const deleteProduct = async (id: string) => {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export const usePOS = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  // ----------------------------
  // Product Management
  // ----------------------------
  const addNewProduct = async (product: Omit<Product, 'id'>) => {
    setLoading(true)
    try {
      const newProduct = await addProduct(product)
      setProducts(prev => [...prev, newProduct])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const updateExistingProduct = async (id: string, updates: Partial<Product>) => {
    setLoading(true)
    try {
      const updatedProduct = await updateProduct(id, updates)
      setProducts(prev => prev.map(p => (p.id === id ? updatedProduct : p)))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteExistingProduct = async (id: string) => {
    setLoading(true)
    try {
      await deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      setCart(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  // ----------------------------
  // Cart Management
  // ----------------------------
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      return [...prev, { ...product, quantity }]
    })
  }

  const updateCartItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(id)
    setCart(prev => prev.map(item => (item.id === id ? { ...item, quantity } : item)))
  }

  const updateCartItemDiscount = (id: string, discount: number) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, discount: Math.max(0, Math.min(100, discount)) }
          : item
      )
    )
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  // ----------------------------
  // Calculations
  // ----------------------------
  const calculateItemTotal = (item: CartItem) => {
    const subtotal = item.price * item.quantity
    const discountAmount = item.discount ? (subtotal * item.discount) / 100 : 0
    return subtotal - discountAmount
  }

  const calculateTotals = () => {
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  return { subtotal, discount: 0, tax: 0, total: subtotal }
}

  // ----------------------------
  // Generate & Save Receipt
  // ----------------------------
 const generateReceipt = async (
  paymentMethod: string,
  _taxRate: number = 0,
  cashier: string = 'System User'
): Promise<Receipt> => {
  const totals = calculateTotals()
  const receipt: Receipt = {
    id: `RCP-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    items: [...cart],
    subtotal: totals.subtotal,
    discount: 0,
    tax: 0,
    total: totals.total,
    paymentMethod,
    timestamp: new Date(),
    cashier,
  }

  // 1. Save receipt
  const { error: receiptError } = await supabase.from('receipts').insert([
    {
      id: receipt.id,
      items: receipt.items,
      subtotal: receipt.subtotal,
      discount: 0,
      tax: 0,
      total: receipt.total,
      payment_method: receipt.paymentMethod,
      cashier: receipt.cashier,
      created_at: receipt.timestamp,
    },
  ])
  if (receiptError) throw receiptError

  // 2. Update product stock for each item
  for (const item of cart) {
    const { error: stockError } = await supabase
      .from('products')
      .update({ stock: item.stock - item.quantity })
      .eq('id', item.id)

    if (stockError) throw stockError
  }

  return receipt
}

  // ----------------------------
  // Load products on mount
  // ----------------------------
  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await fetchProducts()
      setProducts(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  return {
    // State
    products,
    cart,
    loading,
    error,

    // Product CRUD
    addNewProduct,
    updateExistingProduct,
    deleteExistingProduct,

    // Cart
    addToCart,
    updateCartItemQuantity,
    updateCartItemDiscount,
    removeFromCart,
    clearCart,

    // Calculations
    calculateItemTotal,
    calculateTotals,

    // Receipt
    generateReceipt,
    loadProducts,
  }
}
