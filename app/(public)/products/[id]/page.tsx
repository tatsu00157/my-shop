import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { supabase } from '@/lib/supabase'
import { PurchaseButton } from './PurchaseButton'
import { ImageGallery } from './ImageGallery'
import type { Product, ProductImage } from '@/types'
import { TYPE_LABEL } from '@/types'

async function getProduct(id: string): Promise<Product | null> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()
  return data
}

async function getProductImages(productId: string): Promise<ProductImage[]> {
  const { data } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })
  return data ?? []
}

export default async function ProductPage(props: PageProps<'/products/[id]'>) {
  const { id } = await props.params
  const [product, images] = await Promise.all([
    getProduct(id),
    getProductImages(id),
  ])

  if (!product) notFound()

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* 左: 画像 */}
          <div>
            {images.length > 0 ? (
              <ImageGallery images={images} />
            ) : product.thumbnail_url ? (
              <div className="aspect-video relative rounded-2xl overflow-hidden bg-pink-50">
                <Image src={product.thumbnail_url} alt={product.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="aspect-video rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center">
                <span className="text-pink-300 text-6xl">✦</span>
              </div>
            )}
          </div>

          {/* 右: 情報 */}
          <div className="flex flex-col">
            <span className="inline-flex items-center bg-pink-50 text-pink-500 text-xs font-semibold px-3 py-1 rounded-full w-fit mb-4">
              {TYPE_LABEL[product.type]}
            </span>

            <h1 className="text-3xl font-black text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>

            <p className="text-3xl font-black text-pink-500 mb-6">
              ¥{product.price.toLocaleString()}
            </p>

            <div className="flex-1 mb-8">
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            <PurchaseButton productId={product.id} />

            <p className="text-xs text-gray-400 mt-4 text-center">
              購入後すぐにご利用いただけます
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
