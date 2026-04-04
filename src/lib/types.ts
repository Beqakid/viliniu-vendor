export type Role = 'customer' | 'vendor' | 'admin'
export type DeliveryType = 'own_delivery' | 'platform_delivery'
export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'ready_for_delivery' | 'out_for_delivery' | 'delivered' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  phone?: string
  address?: string
  verified: boolean
}

export interface Vendor {
  id: string
  user: string | User
  storeName: string
  storeLogo?: { url: string }
  location: string
  deliveryType: DeliveryType
  approved: boolean
  commissionRate: number
  payoutDetails?: string
}

export interface Product {
  id: string
  vendor: string | Vendor
  name: string
  description?: string
  price: number
  category: string
  images?: Array<{ image: { url: string } }>
  stock: number
  unit: string
  sku?: string
  active: boolean
}

export interface DeliveryAddress {
  recipientName?: string
  phone?: string
  street?: string
  city?: string
  notes?: string
}

export interface OrderItem {
  product: string | Product
  productName?: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Order {
  id: string
  orderNumber: string
  customer: string | User
  vendor: string | Vendor
  items: OrderItem[]
  subtotal: number
  commissionAmount?: number
  deliveryFee: number
  totalAmount: number
  deliveryAddress: DeliveryAddress
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod?: string
  stripeSessionId?: string
  paymentIntentId?: string
  customerNote?: string
  vendorNote?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface PayloadListResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}
