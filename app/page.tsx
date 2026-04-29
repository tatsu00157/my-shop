import Link from 'next/link'
import { Header } from '@/components/Header'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'

async function getProducts(): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function HomePage() {
  const products = await getProducts()

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-12 flex-1">
        <h1 className="text-3xl font-bold mb-2">デジタルコンテンツショップ</h1>
        <p className="text-gray-500 mb-10">
          アプリ・ツール・デジタルコンテンツを販売しています
        </p>

        {products.length === 0 ? (
          <p className="text-gray-400">現在販売中の商品はありません</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition block"
              >
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  {product.type}
                </span>
                <h2 className="text-lg font-semibold mt-1 mb-2">{product.name}</h2>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                  {product.description}
                </p>
                <p className="text-xl font-bold">
                  ¥{product.price.toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
