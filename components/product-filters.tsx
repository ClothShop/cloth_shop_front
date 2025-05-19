"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { fetchCategories } from "@/lib/api"
import type { Category } from "@/types"

export function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [isOpen, setIsOpen] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const currentCategory = Number(searchParams.get("category")) || 0
  const currentSort = searchParams.get("sort") || "newest"
  const currentMinPrice = searchParams.get("minPrice") || ""
  const currentMaxPrice = searchParams.get("maxPrice") || ""

  useEffect(() => {
    const getCategories = async () => {
      setCategoriesLoading(true)
      try {
        const fetchedCategories = await fetchCategories()
        // Ensure categories is always an array
        setCategories(Array.isArray(fetchedCategories) ? fetchedCategories : [])
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        setCategories([])
      } finally {
        setCategoriesLoading(false)
      }
    }

    getCategories()
  }, [])

  useEffect(() => {
    if (currentMinPrice && currentMaxPrice) {
      setPriceRange([Number(currentMinPrice), Number(currentMaxPrice)])
    }
  }, [currentMinPrice, currentMaxPrice])

  const handleCategoryChange = (categoryId: number) => {
    const params = new URLSearchParams(searchParams.toString())

    if (categoryId === currentCategory) {
      params.delete("category")
    } else {
      params.set("category", String(categoryId))
    }

    params.set("page", "1")
    router.push(`/products?${params.toString()}`)
  }

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", sort)
    router.push(`/products?${params.toString()}`)
  }

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values)
  }

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("minPrice", priceRange[0].toString())
    params.set("maxPrice", priceRange[1].toString())
    params.set("page", "1")
    router.push(`/products?${params.toString()}`)
  }

  const resetFilters = () => {
    router.push("/products")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between lg:hidden">
        <h3 className="font-medium">Filters</h3>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? "Hide Filters" : "Show Filters"}
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <FiltersContent
              categories={categories}
              categoriesLoading={categoriesLoading}
              currentCategory={currentCategory}
              currentSort={currentSort}
              priceRange={priceRange}
              handleCategoryChange={handleCategoryChange}
              handleSortChange={handleSortChange}
              handlePriceChange={handlePriceChange}
              applyPriceFilter={applyPriceFilter}
              resetFilters={resetFilters}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="hidden lg:block">
        <FiltersContent
          categories={categories}
          categoriesLoading={categoriesLoading}
          currentCategory={currentCategory}
          currentSort={currentSort}
          priceRange={priceRange}
          handleCategoryChange={handleCategoryChange}
          handleSortChange={handleSortChange}
          handlePriceChange={handlePriceChange}
          applyPriceFilter={applyPriceFilter}
          resetFilters={resetFilters}
        />
      </div>
    </div>
  )
}

interface FiltersContentProps {
  categories: Category[]
  categoriesLoading: boolean
  currentCategory: number
  currentSort: string
  priceRange: number[]
  handleCategoryChange: (categoryId: number) => void
  handleSortChange: (sort: string) => void
  handlePriceChange: (values: number[]) => void
  applyPriceFilter: () => void
  resetFilters: () => void
}

function FiltersContent({
  categories,
  categoriesLoading,
  currentCategory,
  currentSort,
  priceRange,
  handleCategoryChange,
  handleSortChange,
  handlePriceChange,
  applyPriceFilter,
  resetFilters,
}: FiltersContentProps) {
  // Ensure categories is always an array before mapping
  const safeCategories = Array.isArray(categories) ? categories : []

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible defaultValue="categories">
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            {categoriesLoading ? (
              <p className="text-sm text-muted-foreground">Loading categories...</p>
            ) : safeCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories available</p>
            ) : (
              <div className="space-y-2">
                {safeCategories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      className="justify-start px-2 w-full"
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      <span className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border">
                        {currentCategory === category.id && <Check className="h-3 w-3" />}
                      </span>
                      {category.name}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price">
          <AccordionTrigger>Price</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                defaultValue={[0, 1000]}
                value={priceRange}
                min={0}
                max={1000}
                step={10}
                onValueChange={handlePriceChange}
              />
              <div className="flex items-center justify-between">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
              <Button onClick={applyPriceFilter} className="w-full">
                Apply
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="sort">
          <AccordionTrigger>Sort By</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {[
                { id: "newest", label: "Newest" },
                { id: "price-asc", label: "Price: Low to High" },
                { id: "price-desc", label: "Price: High to Low" },
                { id: "name-asc", label: "Name: A to Z" },
                { id: "name-desc", label: "Name: Z to A" },
              ].map((option) => (
                <div key={option.id} className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="justify-start px-2 w-full"
                    onClick={() => handleSortChange(option.id)}
                  >
                    <span className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border">
                      {currentSort === option.id && <Check className="h-3 w-3" />}
                    </span>
                    {option.label}
                  </Button>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Button variant="outline" className="w-full" onClick={resetFilters}>
        Reset Filters
      </Button>
    </div>
  )
}
