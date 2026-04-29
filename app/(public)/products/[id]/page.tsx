import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { supabase } from '@/lib/supabase'
import { PurchaseButton } from './PurchaseButton'
import type { Product } from '@/types'

async function getProduct(id: string): Promise<Product | null> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()
  return data
}

export default async function ProductPage(props: PageProps<'/products/[id]'>) {
  const { id } = await props.params
  const product = await getProduct(id)

  if (!product) notFound()

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
          {product.type}
        </p>
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        <p className="text-2xl font-bold mb-6">¥{product.price.toLocaleString()}</p>
        <p className="text-gray-600 leading-relaxed mb-8 whitespace-pre-wrap">
          {product.description}
        </p>
        <PurchaseButton productId={product.id} />
      </main>
    </>
  )
}
