"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { ProductForm } from "@/components/product-form"
import { useAuth } from "@/lib/auth-provider"
import { createProduct } from "@/lib/api"
import type { Product } from "@/types"

export default function NewProductPage() {
    const { user, loading, isAdmin } = useAuth()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push("/login")
        }
    }, [loading, isAdmin, router])

    const handleSave = async (productData: Omit<Product, "id">) => {
        setIsSubmitting(true)
        try {
            await createProduct(productData)
            router.push("/admin/products")
        } catch (error) {
            console.error("Failed to create product:", error)
            // Handle error
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return <p>Loading...</p>
    }

    if (!isAdmin) {
        return null
    }

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
            </div>
            <ProductForm onSave={handleSave} isSubmitting={isSubmitting} />
        </AdminLayout>
    )
}
