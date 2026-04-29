import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { ProductForm } from '../../../components/ProductForm'
import type { Product, ProductImage } from '@/types'

async function getProduct(id: string): Promise<Product | null> {
  const { data } = await supabaseAdmin.from('products').select('*').eq('id', id).single()
  return data
}

async function getProductImages(productId: string): Promise<ProductImage[]> {
  const { data } = await supabaseAdmin
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })
  return data ?? []
}

export default async function EditProductPage(props: PageProps<'/admin/products/[id]/edit'>) {
  const { id } = await props.params
  const [product, images] = await Promise.all([getProduct(id), getProductImages(id)])

  if (!product) notFound()

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-8">商品を編集</h1>
      <ProductForm product={product} productImages={images} />
    </div>
  )
}
