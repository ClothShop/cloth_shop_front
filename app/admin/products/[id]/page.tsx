"use client"

import {useState, useEffect, use} from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { ProductForm } from "@/components/product-form"
import { useAuth } from "@/lib/auth-provider"
import { fetchProduct, updateProduct } from "@/lib/api"
import type { Product } from "@/types"

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { user, loading, isAdmin } = useAuth()
    const router = useRouter()
    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const {id} = use(params)

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push("/login")
        }
    }, [loading, isAdmin, router])

    useEffect(() => {
        const getProduct = async () => {
            setIsLoading(true)
            try {
                const data = await fetchProduct(id)
                setProduct(data)
            } catch (error) {
                console.error("Failed to fetch product:", error)
            } finally {
                setIsLoading(false)
            }
        }

        if (isAdmin && id) {
            getProduct()
        }
    }, [isAdmin, id])

    const handleSave = async (productData: Partial<Product>) => {
        setIsSubmitting(true)
        try {
            await updateProduct(id, productData)
            router.push("/admin/products")
        } catch (error) {
            console.error("Failed to update product:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading || isLoading) {
        return <p>Loading...</p>
    }

    if (!isAdmin) {
        return null
    }

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
            </div>
            {product && <ProductForm product={product} onSave={handleSave} isSubmitting={isSubmitting} />}
        </AdminLayout>
    )
}
