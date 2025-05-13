"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product, CartItem } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-provider"

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: Product, quantity?: number, variant?: string) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  subtotal: number
  totalItems: number
  applyPromoCode: (code: string) => Promise<boolean>
  promoCode: string | null
  discount: number
  total: number
  checkout: () => Promise<boolean>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [promoCode, setPromoCode] = useState<string | null>(null)
  const [discount, setDiscount] = useState(0)
  const { toast } = useToast()
  const { user, hasEnoughFunds, withdrawFunds } = useAuth()

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    const savedPromo = localStorage.getItem("promoCode")
    const savedDiscount = localStorage.getItem("discount")

    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }

    if (savedPromo) {
      setPromoCode(savedPromo)
    }

    if (savedDiscount) {
      setDiscount(Number(savedDiscount))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems))
  }, [cartItems])

  // Save promo code and discount to localStorage whenever they change
  useEffect(() => {
    if (promoCode) {
      localStorage.setItem("promoCode", promoCode)
    } else {
      localStorage.removeItem("promoCode")
    }

    localStorage.setItem("discount", discount.toString())
  }, [promoCode, discount])

  const addToCart = (product: Product, quantity = 1, variant?: string) => {
    setCartItems((prevItems) => {
      // If variant is specified, check if that specific variant is already in cart
      if (variant) {
        const existingItemWithVariant = prevItems.find(
          (item) => item.product.id === product.id && item.variant === variant,
        )

        if (existingItemWithVariant) {
          return prevItems.map((item) =>
            item.product.id === product.id && item.variant === variant
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        }

        // If not found with variant, add as new item with variant
        return [...prevItems, { product, quantity, variant }]
      } else {
        // Original behavior for items without variants
        const existingItem = prevItems.find((item) => item.product.id === product.id && !item.variant)

        if (existingItem) {
          return prevItems.map((item) =>
            item.product.id === product.id && !item.variant ? { ...item, quantity: item.quantity + quantity } : item,
          )
        }

        return [...prevItems, { product, quantity }]
      }
    })

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return

    setCartItems((prevItems) => prevItems.map((item) => (item.product.id === productId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCartItems([])
    setPromoCode(null)
    setDiscount(0)
    localStorage.removeItem("cart")
    localStorage.removeItem("promoCode")
    localStorage.removeItem("discount")
  }

  const applyPromoCode = async (code: string): Promise<boolean> => {
    try {
      // For demo purposes, accept any promo code
      const discountPercentage = 15
      setPromoCode(code)
      setDiscount(discountPercentage)
      toast({
        title: "Promo code applied",
        description: `${code} has been applied to your cart.`,
      })
      return true
    } catch (error) {
      console.error("Error validating promo code:", error)
      toast({
        title: "Error",
        description: "Failed to validate promo code. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const checkout = async (): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to complete your purchase.",
        variant: "destructive",
      })
      return false
    }

    if (!hasEnoughFunds(total)) {
      toast({
        title: "Insufficient funds",
        description: `You need $${total.toFixed(2)} to complete this purchase. Please add funds to your wallet.`,
        variant: "destructive",
      })
      return false
    }

    try {
      // Process payment
      await withdrawFunds(total)

      // Clear cart after successful purchase
      clearCart()

      toast({
        title: "Order placed successfully!",
        description: `$${total.toFixed(2)} has been deducted from your wallet.`,
      })

      return true
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Checkout failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const subtotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0)

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

  const total = discount > 0 ? subtotal * (1 - discount / 100) : subtotal

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        totalItems,
        applyPromoCode,
        promoCode,
        discount,
        total,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
