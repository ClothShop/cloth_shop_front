"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product, CartItem } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-provider"
import axios from "axios";

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

  const addToCart = async (product: Product, quantity = 1) => {
    try {
      const response = await axios.post(
          "http://localhost:8888/api/v1/carts/me/add",
          {
            product_id: product.id,
            quantity,
          },
          { withCredentials: true }
      )

      setCartItems(response.data)
      localStorage.setItem("cart", JSON.stringify(cartItems))

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      })
    } catch (error) {
      console.error("Failed to add to cart:", error)
      toast({
        title: "Error",
        description: "Could not add item to cart. Please try again.",
        variant: "destructive",
      })
    }
  }

  const removeFromCart = async (productId: string) => {
    try {
      const response = await axios.delete(
          `http://localhost:8888/api/v1/carts/me/${productId}`,
          { withCredentials: true }
      )

      setCartItems(response.data)
      localStorage.setItem("cart", JSON.stringify(cartItems))

      toast({
        title: "Removed from cart",
        description: `Product has been removed from your cart.`,
      })
    } catch (error) {
      console.error("Failed to remove product from cart:", error)
      toast({
        title: "Error",
        description: "Could not remove product from cart. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      let response;
      if (quantity === -1) {
        response = await axios.delete(
            `http://localhost:8888/api/v1/carts/me/${productId}/decrement`,
            { withCredentials: true }
        )
      } else {
        response = await axios.post(
            `http://localhost:8888/api/v1/carts/me/add`,
            {
              product_id: productId,
              quantity: 1,
            },
            { withCredentials: true }
        )
      }

      setCartItems(response.data)
      localStorage.setItem("cart", JSON.stringify(cartItems))

      toast({
        title: "Product has been updated",
        description: `Product has been updated.`,
      })
    } catch (error) {
      console.error("Failed to update product from cart:", error)
      toast({
        title: "Error",
        description: "Could not update product quantity from cart. Please try again.",
        variant: "destructive",
      })
    }
  }

  const clearCart = async () => {
    try {
      await axios.delete(
          `http://localhost:8888/api/v1/carts/me`,
          { withCredentials: true }
      )

      setCartItems([])
      setPromoCode(null)
      setDiscount(0)
      localStorage.removeItem("cart")
      localStorage.removeItem("promoCode")
      localStorage.removeItem("discount")

      toast({
        title: "Cart removed",
        description: `Cart removed.`,
      })
    } catch (error) {
      console.error("Failed to remove cart:", error)
      toast({
        title: "Error",
        description: "Could not remove cart. Please try again.",
        variant: "destructive",
      })
    }
  }

  const applyPromoCode = async (code: string): Promise<boolean> => {
    try {
      const response = await axios.get(`http://localhost:8888/api/v1/promos/code/${code}`)
      const discountPercentage = response.data.discount_percentage
      if (!discountPercentage) {
        return false;
      }
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

  const subtotal = cartItems.reduce((total, item) => {
    return total + item.product.price * item.quantity
  }, 0)

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
