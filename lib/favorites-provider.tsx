"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

interface FavoritesContextType {
  favorites: string[]
  toggleFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
  clearFavorites: () => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])
  const { toast } = useToast()

  // Load favorites from localStorage on initial render
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (productId: string) => {
    setFavorites((prevFavorites) => {
      const isFavorited = prevFavorites.includes(productId)

      if (isFavorited) {
        toast({
          title: "Removed from favorites",
          description: "The item has been removed from your favorites.",
        })
        return prevFavorites.filter((id) => id !== productId)
      } else {
        toast({
          title: "Added to favorites",
          description: "The item has been added to your favorites.",
        })
        return [...prevFavorites, productId]
      }
    })
  }

  const isFavorite = (productId: string) => favorites.includes(productId)

  const clearFavorites = () => {
    setFavorites([])
    localStorage.removeItem("favorites")
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
