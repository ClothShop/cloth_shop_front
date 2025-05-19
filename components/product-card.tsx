"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-provider"
import { useFavorites } from "@/lib/favorites-provider"
import { cn } from "@/lib/utils"
import type { Product } from "@/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const { addToCart } = useCart()
  const { favorites, toggleFavorite } = useFavorites()
  const isFavorite = favorites.some((id) => id === product.id)

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-background">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 z-10 rounded-full bg-background/80 backdrop-blur-sm"
        onClick={() => toggleFavorite(product.id)}
      >
        <Heart className={cn("h-5 w-5", isFavorite ? "fill-primary text-primary" : "text-muted-foreground")} />
        <span className="sr-only">Toggle favorite</span>
      </Button>
      <Link href={`/products/${product.id}`} className="relative block aspect-[3/4]">
        <Image
          src={
            product.images && Array.isArray(product.images) && product.images.length > 0
              ? product.images[0]
              : "/placeholder.svg"
          }
          alt={product.name}
          fill
          className={cn(
            "object-cover transition-all duration-300 group-hover:scale-105",
            isLoading ? "blur-sm" : "blur-0",
          )}
          onLoad={() => setIsLoading(false)}
        />
      </Link>
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium line-clamp-1">{product.name}</h3>
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm font-medium">
            ${product.price.toFixed(2)}
            {product.compare_at_price && (
              <span className="ml-2 text-muted-foreground line-through">${product.compare_at_price.toFixed(2)}</span>
            )}
          </p>
          {product.variants && (
            <p className="text-xs text-muted-foreground">
              {product.variants.length} {product.variants.length === 1 ? "variant" : "variants"}
            </p>
          )}
        </div>
        <Button className="mt-4 w-full text-sm h-9" onClick={() => addToCart(product)}>
          Add to Cart
        </Button>
      </div>
    </div>
  )
}
