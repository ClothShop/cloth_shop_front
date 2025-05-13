"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useFavorites } from "@/lib/favorites-provider"
import { fetchProduct } from "@/lib/api"
import type { Product } from "@/types"

export default function FavoritesPage() {
  const { favorites } = useFavorites()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true)
      try {
        const productPromises = favorites.map((id) => fetchProduct(id))
        const favoriteProducts = await Promise.all(productPromises)
        setProducts(favoriteProducts)
      } catch (error) {
        console.error("Failed to fetch favorite products:", error)
      } finally {
        setLoading(false)
      }
    }

    getProducts()
  }, [favorites])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-12">
          <h1 className="text-3xl font-bold tracking-tight">Favorites</h1>
          {loading ? (
            <p className="mt-8">Loading your favorites...</p>
          ) : favorites.length === 0 ? (
            <div className="mt-12 flex flex-col items-center justify-center space-y-4">
              <p className="text-lg text-muted-foreground">You haven't added any favorites yet</p>
              <Button asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
