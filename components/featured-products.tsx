"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { fetchFeaturedProducts } from "@/lib/api"
import type { Product } from "@/types"

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        // Get mock featured products
        const featuredProducts = await fetchFeaturedProducts()
        setProducts(featuredProducts)
      } catch (error) {
        console.error("Failed to fetch featured products:", error)
        setProducts([])
        setError("Failed to load featured products")
      } finally {
        setLoading(false)
      }
    }

    getProducts()
  }, [])

  if (loading) {
    return <p>Loading featured products...</p>
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  if (products.length === 0) {
    return <p>No featured products available.</p>
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
