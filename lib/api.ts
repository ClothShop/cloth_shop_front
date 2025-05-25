import axios from "axios"
import type { Product, Category, PromoCode } from "@/types"
import {object} from "zod";

// Configure axios with default headers
axios.defaults.baseURL = "http://localhost"

interface ProductsParams {
  page?: number
  limit?: number
  category?: string
  sort?: string
  minPrice?: number
  maxPrice?: number
  search?: string
}

interface UserUpdateDto {
  email?: string
  name?: string
  current_password?: string
  new_password?: string
  is_changing_password?: boolean,
}

export async function fetchProducts(params: ProductsParams = {}) {
  try {
    const response = await axios.get("http://localhost:8888/api/v1/products", {withCredentials: true})
    return {
      products: Array.isArray(response.data) ? response.data : [],
      totalPages: response.data.totalPages || 1,
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    // Return mock data for demo purposes
    return {
      products: Array(12)
        .fill(0)
        .map((_, i) => ({
          id: `product-${i + 1}`,
          name: `Product ${i + 1}`,
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          price: 49.99 + i * 10,
          compareAtPrice: i % 3 === 0 ? 69.99 + i * 10 : null,
          images: [`/placeholder.svg?height=600&width=400&text=Product+${i + 1}`],
          category: "category-1",
          variants: Array((i % 3) + 1)
            .fill(0)
            .map((_, j) => ({
              id: `variant-${i}-${j}`,
              name: `Variant ${j + 1}`,
              price: 49.99 + i * 10 + j * 5,
            })),
        })),
      totalPages: 5,
    }
  }
}

export async function fetchProduct(id: string) {
  try {
    const response = await axios.get(`http://localhost:8888/api/v1/products/${id}`)
    // Ensure images is always an array
    const data = response.data
    if (!data.images || !Array.isArray(data.images)) {
      data.images = []
    }
    return data
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error)
    // Return mock data for demo purposes
    return {
      id,
      name: `Product ${id}`,
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      price: 99.99,
      compareAtPrice: 129.99,
      images: [
        `/placeholder.svg?height=800&width=600&text=Product+${id}+Image+1`,
        `/placeholder.svg?height=800&width=600&text=Product+${id}+Image+2`,
        `/placeholder.svg?height=800&width=600&text=Product+${id}+Image+3`,
      ],
      category: "category-1",
      variants: [
        {
          id: `${id}-variant-1`,
          name: "Small",
          price: 99.99,
        },
        {
          id: `${id}-variant-2`,
          name: "Medium",
          price: 99.99,
        },
        {
          id: `${id}-variant-3`,
          name: "Large",
          price: 109.99,
        },
      ],
    }
  }
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  console.log("Using mock featured products data")

  return []
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await axios.get("http://localhost:8888/api/v1/categories")
    // Ensure we return an array
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error("Error fetching categories:", error)
    // Return mock data for demo purposes
    return [
      { id: 1, name: "T-Shirts" }
    ]
  }
}

export async function createOrder(orderData: any) {
  try {
    const response = await axios.post("http://localhost:8888/api/v1/orders", orderData)
    return response.data
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}

export async function fetchOrders() {
  try {
    const response = await axios.get("http://localhost:8888/api/v1/orders/me", {withCredentials: true})
    return response.data
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw error
  }
}

export async function fetchAnalytics() {
  try {
    const response = await axios.get("http://localhost:8888/api/v1/analytics")
    return response.data
  } catch (error) {
    console.error("Error fetching analytics:", error)
    // Return mock data for demo purposes
    return {
      totalSales: 12500,
      totalOrders: 150,
      averageOrderValue: 83.33,
      topProducts: [
        { id: "product-1", name: "Product 1", sales: 42 },
        { id: "product-2", name: "Product 2", sales: 38 },
        { id: "product-3", name: "Product 3", sales: 27 },
      ],
      salesByCategory: [
        { category: "T-Shirts", sales: 4500 },
        { category: "Shirts", sales: 3200 },
        { category: "Pants", sales: 2800 },
        { category: "Jackets", sales: 2000 },
      ],
      recentSales: Array(5)
        .fill(0)
        .map((_, i) => ({
          id: `order-${100 + i}`,
          customer: `Customer ${i + 1}`,
          amount: 75 + i * 25,
          date: new Date(Date.now() - i * 86400000).toISOString(),
          status: "completed",
        })),
    }
  }
}

export async function createProduct(productData: Omit<Product, "id">) {
  try {
    const formData = new FormData()
    formData.append("product", JSON.stringify(productData))
    if (productData.image_files && Array.isArray(productData.image_files)) {
      for (const file of productData.image_files) {
        formData.append("images", file)
      }
    }

    const response = await axios.post("http://localhost:8888/api/v1/products", formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

export async function updateProduct(id: string, productData: Partial<Product>) {
  try {
    console.log("updated product: ", productData)
    const response = await axios.put(`http://localhost:8888/api/v1/products/${id}`, productData, {withCredentials: true})
    return response.data
  } catch (error) {
    console.error(`Error updating product ${id}:`, error)
    throw error
  }
}

export async function deleteProduct(id: string) {
  try {
    await axios.delete(`http://localhost:8888/api/v1/products/${id}`, {withCredentials: true})
    return true
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error)
    throw error
  }
}

export async function createPromoCode(promoData: any) {
  try {
    const response = await axios.post("http://localhost:8888/api/v1/promos", promoData, {withCredentials: true})
    return response.data
  } catch (error) {
    console.error("Error creating promo code:", error)
    throw error
  }
}

export async function fetchPromoCodes(): Promise<PromoCode[]> {
  try {
    const response = await axios.get("http://localhost:8888/api/v1/promos", {withCredentials: true})
    if (Array.isArray(response.data)) {
      return response.data
    }
    console.error("Expected array but got:", response.data)
    return []
  } catch (error) {
    console.error("Error fetching promo codes:", error)
    // Return mock data for demo purposes with all required properties
    return Array(5)
      .fill(0)
      .map((_, i) => ({
        _id: `promo-${i + 1}`,
        code: `DISCOUNT${i + 1}`,
        discount_percentage: (i + 1) * 5,
        valid_from: new Date(Date.now() - i * 86400000).toISOString(),
        valid_to: new Date(Date.now() + (30 - i) * 86400000).toISOString(),
        is_active: i < 4,
      }))
  }
}

export async function updatePromoCode(id: string, promoData: any) {
  try {
    const response = await axios.put(`http://localhost:8888/api/v1/promos/${id}`, promoData, {withCredentials: true})
    return response.data
  } catch (error) {
    console.error(`Error updating promo code ${id}:`, error)
    throw error
  }
}

export async function deletePromoCode(id: string) {
  try {
    await axios.delete(`http://localhost:8888/api/v1/promos/${id}`, {withCredentials: true})
    return true
  } catch (error) {
    console.error(`Error deleting promo code ${id}:`, error)
    throw error
  }
}

export async function updateUserProfile(reqBody: UserUpdateDto): Promise<void> {
  try {
    await axios.patch(`http://localhost:8888/api/v1/users/me`, reqBody, {withCredentials: true})
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}
