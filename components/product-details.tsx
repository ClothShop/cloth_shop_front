"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Heart, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-provider"
import { useFavorites } from "@/lib/favorites-provider"
import { fetchProduct } from "@/lib/api"
import type { Product, ProductVariant } from "@/types"
import { cn } from "@/lib/utils"

interface ProductDetailsProps {
  id: string
}

export function ProductDetails({ id }: ProductDetailsProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const { favorites, toggleFavorite } = useFavorites()
  const isFavorite = product ? favorites.includes(product.id) : false

  useEffect(() => {
    const getProduct = async () => {
      setLoading(true)
      try {
        const productData = await fetchProduct(id)
        setProduct(productData)
        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0])
        }
      } catch (error) {
        console.error(`Failed to fetch product ${id}:`, error)
      } finally {
        setLoading(false)
      }
    }

    getProduct()
  }, [id])

  const handleAddToCart = () => {
    if (product) {
      if (selectedVariant) {
        // Add to cart with the selected variant
        addToCart(product, quantity, selectedVariant.name)
      } else {
        // Add to cart without variant
        addToCart(product, quantity)
      }
    }
  }

  const handleQuantityChange = (value: number) => {
    if (value >= 1) {
      setQuantity(value)
    }
  }

  if (loading) {
    return <p>Loading product details...</p>
  }

  if (!product) {
    return <p>Product not found</p>
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-lg">
          <Image
            src={product.images[selectedImage] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {product.images.map((image, index) => (
            <button
              key={index}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border-2",
                selectedImage === index ? "border-primary" : "border-transparent",
              )}
              onClick={() => setSelectedImage(index)}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${product.name} - Image ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="mt-2 flex items-center">
            <p className="text-2xl font-semibold">
              ${selectedVariant ? selectedVariant.price.toFixed(2) : product.price.toFixed(2)}
            </p>
            {product.compare_at_price && (
              <p className="ml-2 text-lg text-muted-foreground line-through">${product.compare_at_price.toFixed(2)}</p>
            )}
          </div>
        </div>
        <div className="prose max-w-none">
          <p>{product.description}</p>
        </div>
        <div className="space-y-2">
          <p className="font-medium">Quantity</p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <span className="w-12 text-center">{quantity}</span>
            <Button variant="outline" size="icon" onClick={() => handleQuantityChange(quantity + 1)}>
              +
            </Button>
          </div>
        </div>
        <div className="flex gap-4">
          <Button className="flex-1" onClick={handleAddToCart}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
          <Button variant="outline" size="icon" onClick={() => toggleFavorite(product.id)}>
            <Heart className={cn("h-5 w-5", isFavorite ? "fill-primary text-primary" : "text-muted-foreground")} />
            <span className="sr-only">Toggle favorite</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
