export type ProductType = 'download' | 'saas' | 'content'

export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  type: ProductType
  file_key: string | null
  stripe_price_id: string
  thumbnail_url: string | null
  is_active: boolean
  created_at: string
}

export type ProductImage = {
  id: string
  product_id: string
  url: string
  sort_order: number
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
  product?: Product
}

export const TYPE_LABEL: Record<ProductType, string> = {
  download: 'ダウンロード',
  saas: 'システム',
  content: 'コンテンツ',
}
