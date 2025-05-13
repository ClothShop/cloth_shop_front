"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchOrders } from "@/lib/api"
import type { Order } from "@/types"

export function AccountOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getOrders = async () => {
      setLoading(true)
      try {
        const fetchedOrders = await fetchOrders()
        setOrders(fetchedOrders)
      } catch (error) {
        console.error("Failed to fetch orders:", error)
        // Mock data for demo
        setOrders([
          {
            id: "order-1",
            userId: "user-1",
            items: [
              {
                productId: "product-1",
                productName: "Classic White T-Shirt",
                price: 29.99,
                quantity: 2,
              },
              {
                productId: "product-2",
                productName: "Black Denim Jeans",
                price: 59.99,
                quantity: 1,
              },
            ],
            subtotal: 119.97,
            discount: 10,
            total: 107.97,
            promoCode: "WELCOME10",
            status: "delivered",
            shippingAddress: {
              firstName: "John",
              lastName: "Doe",
              address1: "123 Main St",
              city: "New York",
              state: "NY",
              postalCode: "10001",
              country: "USA",
              phone: "555-123-4567",
            },
            billingAddress: {
              firstName: "John",
              lastName: "Doe",
              address1: "123 Main St",
              city: "New York",
              state: "NY",
              postalCode: "10001",
              country: "USA",
              phone: "555-123-4567",
            },
            paymentMethod: "Credit Card",
            createdAt: "2023-01-15T12:00:00Z",
          },
          {
            id: "order-2",
            userId: "user-1",
            items: [
              {
                productId: "product-3",
                productName: "Navy Blue Blazer",
                price: 149.99,
                quantity: 1,
              },
            ],
            subtotal: 149.99,
            discount: 0,
            total: 149.99,
            status: "shipped",
            shippingAddress: {
              firstName: "John",
              lastName: "Doe",
              address1: "123 Main St",
              city: "New York",
              state: "NY",
              postalCode: "10001",
              country: "USA",
              phone: "555-123-4567",
            },
            billingAddress: {
              firstName: "John",
              lastName: "Doe",
              address1: "123 Main St",
              city: "New York",
              state: "NY",
              postalCode: "10001",
              country: "USA",
              phone: "555-123-4567",
            },
            paymentMethod: "PayPal",
            createdAt: "2023-02-20T15:30:00Z",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    getOrders()
  }, [])

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <p>Loading your orders...</p>
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Orders Yet</CardTitle>
          <CardDescription>You haven't placed any orders yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Order #{order.id}</CardTitle>
                <CardDescription>Placed on {new Date(order.createdAt).toLocaleDateString()}</CardDescription>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                  order.status,
                )}`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-4">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex justify-between py-2">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p>${order.subtotal.toFixed(2)}</p>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <p>Discount</p>
                    <p>-${(order.subtotal - order.total).toFixed(2)}</p>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <p>Total</p>
                  <p>${order.total.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" asChild>
                  <Link href={`/account/orders/${order.id}`}>View Details</Link>
                </Button>
                {order.status === "delivered" && <Button variant="outline">Write a Review</Button>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
