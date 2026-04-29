export type ProductType = 'download' | 'saas' | 'content'

export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  type: ProductType
  file_key: string | null
  stripe_price_id: string
  is_active: boolean
  created_at: string
}

export type PurchaseStatus = 'pending' | 'completed' | 'refunded'

export type Purchase = {
  id: string
  user_email: string
  product_id: string
  stripe_session_id: string
  status: PurchaseStatus
  created_at: string
  // JOINしたときに付与される
  product?: Product
}
