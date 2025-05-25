export interface User {
  id: string
  name: string
  email: string
  role: "User" | "Admin"
  walletBalance: number
}

export interface Address {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
}

export interface Order {
  _id: string
  userId: string
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  promoCode?: string | null
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: string
  createdAt: string
}

export interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
  variant?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  compare_at_price?: number | null
  images: string[]
  image_files: File[]
  category: Category
  category_id: number
  variants?: ProductVariant[]
}

export interface ProductVariant {
  id: string
  name: string
  price: number
}

export interface Category {
  id: number
  name: string
}

export interface PromoCode {
  _id: string
  code: string
  discount_percentage: number
  valid_from: string
  valid_to: string
  is_active: boolean
}

export interface CartItem {
  product: Product
  quantity: number
  variant?: string
}

export interface Analytics {
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  topProducts: { id: string; name: string; sales: number }[]
  salesByCategory: { category: string; sales: number }[]
  recentSales: { id: string; customer: string; amount: number; date: string; status: string }[]
}
