"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { Pagination } from "@/components/ui/pagination"
import { useSearchParams } from "next/navigation"
import { fetchProducts } from "@/lib/api"
import type { Product } from "@/types"

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const searchParams = useSearchParams()

  const page = Number(searchParams.get("page") || 1)
  const category = searchParams.get("category") || ""
  const sort = searchParams.get("sort") || "newest"
  const minPrice = searchParams.get("minPrice") || ""
  const maxPrice = searchParams.get("maxPrice") || ""
  const search = searchParams.get("search") || ""

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true)
      try {
        const response = await fetchProducts({
          page,
          category,
          sort,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          search,
        })

        // Ensure products is always an array
        setProducts(response?.products || [])
        setTotalPages(response?.totalPages || 1)
      } catch (error) {
        console.error("Failed to fetch products:", error)
        // Set default values in case of error
        setProducts([])
        setTotalPages(1)
      } finally {
        setLoading(false)
      }
    }

    getProducts()
  }, [page, category, sort, minPrice, maxPrice, search])

  if (loading) {
    return <p className="text-center py-8">Loading products...</p>
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="text-xl font-medium">No products found</h3>
        <p className="mt-2 text-muted-foreground">Try adjusting your filters or search term</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Pagination totalPages={totalPages} currentPage={page} />
    </div>
  )
}
