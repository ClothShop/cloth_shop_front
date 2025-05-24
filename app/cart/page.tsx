"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useCart } from "@/lib/cart-provider"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, subtotal, applyPromoCode, promoCode, discount, total, checkout } =
    useCart()
  const [promoInput, setPromoInput] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()
  const isDisabled = isCheckingOut || !!(user && user.walletBalance < total)

  const handleApplyPromoCode = async () => {
    if (!promoInput.trim()) return

    const isApplied = await applyPromoCode(promoInput.trim())
    setIsApplying(isApplied)
  }

  const handleBuyNow = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to complete your purchase.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsCheckingOut(true)
    try {
      const success = await checkout()
      if (success) {
        router.push("/account/orders")
      }
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-gray-50">
        <div className="container py-8 sm:py-12 px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Your Shopping Cart</h1>
          {cartItems.length === 0 ? (
            <div className="mt-8 sm:mt-12 flex flex-col items-center justify-center space-y-6 py-8 sm:py-12 bg-white rounded-lg shadow-sm">
              <div className="rounded-full bg-gray-100 p-6">
                <ShoppingBag className="h-10 sm:h-12 w-10 sm:w-12 text-gray-400" />
              </div>
              <div className="text-center px-4">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Looks like you haven't added any products to your cart yet.
                </p>
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/products">Browse Products</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-6 border-b">
                    <h2 className="text-lg sm:text-xl font-semibold">Items ({cartItems.length})</h2>
                  </div>
                  <div>
                    {cartItems.map((item) => (
                      <div
                        key={item.product.id}
                        className="grid grid-cols-[80px_1fr] gap-3 sm:gap-4 p-4 sm:p-6 border-b last:border-0 hover:bg-gray-50 transition-colors sm:grid-cols-[120px_1fr] md:gap-6"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-md border bg-gray-100">
                          <Image
                            src={
                              item.product.images &&
                              Array.isArray(item.product.images) &&
                              item.product.images.length > 0
                                ? item.product.images[0]
                                : "/placeholder.svg"
                            }
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="grid gap-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-base sm:text-lg">{item.product.name}</h3>
                              <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)}</p>
                              {item.variant && <p className="text-xs text-muted-foreground">Size: {item.variant}</p>}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.product.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                              onClick={() => updateQuantity(item.product.id, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                              <span className="sr-only">Decrease quantity</span>
                            </Button>
                            <span className="w-6 sm:w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                              onClick={() => updateQuantity(item.product.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                              <span className="sr-only">Increase quantity</span>
                            </Button>
                            <div className="ml-auto font-medium">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white rounded-lg shadow-sm sticky top-20">
                  <div className="p-4 sm:p-6 border-b">
                    <h2 className="text-lg sm:text-xl font-semibold">Order Summary</h2>
                  </div>
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({discount}%)</span>
                        <span>-${(subtotal * (discount / 100)).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between font-medium text-base sm:text-lg pt-4 border-t">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>

                    {user && (
                      <div className="flex justify-between items-center pt-2 text-sm">
                        <span className="flex items-center">
                          <Wallet className="h-4 w-4 mr-1" />
                          Wallet Balance
                        </span>
                        <span
                          className={
                            user.walletBalance < total ? "text-red-500 font-medium" : "text-green-600 font-medium"
                          }
                        >
                          ${user.walletBalance.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="pt-4">
                      <div className="flex gap-2 flex-col sm:flex-row">
                        <Input
                          placeholder="Promo code"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          disabled={!!promoCode || isApplying}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={handleApplyPromoCode}
                          disabled={!!promoCode || isApplying || !promoInput.trim()}
                          className="sm:w-auto w-full"
                        >
                          Apply
                        </Button>
                      </div>
                      {promoCode && <p className="mt-2 text-sm text-green-600">Promo code {promoCode} applied!</p>}
                    </div>
                    <Button
                      className="w-full h-10 sm:h-12 text-base sm:text-lg mt-6"
                      onClick={handleBuyNow}
                      disabled={isDisabled}
                    >
                      {isCheckingOut ? "Processing..." : "Buy Now"}
                    </Button>
                    <Button asChild className="w-full" variant="outline">
                      <Link href="/checkout">
                        Proceed to Checkout
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full">
                      <Link href="/products">Continue Shopping</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
