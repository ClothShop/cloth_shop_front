"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { fetchCategories } from "@/lib/api"
import type { Product, Category, ProductVariant } from "@/types"

interface ProductFormProps {
    product?: Product
    onSave: (productData: any) => Promise<void>
    isSubmitting: boolean
}

export function ProductForm({ product, onSave, isSubmitting }: ProductFormProps) {
    const [name, setName] = useState(product?.name || "")
    const [description, setDescription] = useState(product?.description || "")
    const [price, setPrice] = useState(product?.price.toString() || "")
    const [compareAtPrice, setCompareAtPrice] = useState(product?.compare_at_price?.toString())
    const [category_id, setCategoryId] = useState(product?.category.id || 0)
    const [images, setImages] = useState<File[]>([])
    const [variants, setVariants] = useState<Partial<ProductVariant>[]>(product?.variants || [{ name: "", price: 0 }])
    const [categories, setCategories] = useState<Category[]>([])
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        const getCategories = async () => {
            try {
                const fetchedCategories = await fetchCategories()
                setCategories(fetchedCategories)
            } catch (error) {
                console.error("Failed to fetch categories:", error)
            }
        }

        getCategories()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form
        const newErrors: Record<string, string> = {}

        if (!name.trim()) {
            newErrors.name = "Product name is required"
        }

        if (!description.trim()) {
            newErrors.description = "Product description is required"
        }

        if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
            newErrors.price = "Valid price is required"
        }

        if (!category_id) {
            newErrors.category = "Category is required"
        }

        if(!product) {
            if (images.length === 0) {
                newErrors.images = "At least one image is required"
            }
        }

        setErrors(newErrors)

        if (Object.keys(newErrors).length > 0) {
            return
        }

        const productData = {
            name,
            description,
            price: Number(price),
            compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
            category_id,
            image_files: images,
        }

        await onSave(productData)
    }

    const handleAddImage = () => {
        setImages([...images, new File([], "")])
    }

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index))
    }

    const handleImageChange = (index: number, file: File | null) => {
        const newImages = [...images]
        if (file) newImages[index] = file
        setImages(newImages)
    }

    const handleAddVariant = () => {
        setVariants([...variants, { name: "", price: 0 }])
    }

    const handleRemoveVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index))
    }

    const handleVariantChange = (index: number, field: keyof ProductVariant, value: string) => {
        const newVariants = [...variants]
        if (field === "price") {
            newVariants[index] = { ...newVariants[index], [field]: Number(value) }
        } else {
            newVariants[index] = { ...newVariants[index], [field]: value }
        }
        setVariants(newVariants)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter product name"
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter product description"
                                rows={5}
                            />
                            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0.00"
                                />
                                {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="compareAtPrice">Compare at Price (Optional)</Label>
                                <Input
                                    id="compareAtPrice"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={compareAtPrice}
                                    onChange={(e) => setCompareAtPrice(e.target.value)}
                                    placeholder="0.00"
                                />
                                {errors.compareAtPrice && <p className="text-sm text-red-500">{errors.compareAtPrice}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={category_id.toString()}
                                onValueChange={(val) => setCategoryId(Number(val))}
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>
            {!product?
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">Images</h3>
                        <div className="space-y-4">
                            {images.map((image, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(index, e.target.files?.[0] || null)}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleRemoveImage(index)}
                                        disabled={images.length === 1}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={handleAddImage}>
                                Add Image
                            </Button>
                            {errors.images && <p className="text-sm text-red-500">{errors.images}</p>}
                        </div>
                    </CardContent>
                </Card>:
                ""
            }

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Product"}
                </Button>
            </div>
        </form>
    )
}
