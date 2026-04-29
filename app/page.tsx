import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'
import { TYPE_LABEL } from '@/types'

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

      {/* ヒーロー */}
      <section className="bg-gradient-to-br from-pink-50 to-white border-b border-pink-100">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <p className="text-pink-500 font-semibold text-sm tracking-widest mb-4 uppercase">
            Digital Contents
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-5 leading-tight">
            欲しいデジタルコンテンツが<br className="hidden sm:block" />
            きっと見つかる
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            アプリ・ツール・素材・コンテンツなど、<br />
            あらゆるデジタル商品を取り揃えています
          </p>
        </div>
      </section>

      {/* 商品一覧 */}
      <main className="max-w-6xl mx-auto px-4 py-14 flex-1">
        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">現在販売中の商品はありません</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-8">
              すべての商品
              <span className="ml-2 text-sm font-normal text-gray-400">
                {products.length}件
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-pink-100 transition-all duration-200"
                >
                  {/* サムネイル */}
                  <div className="aspect-video bg-gradient-to-br from-pink-50 to-pink-100 relative overflow-hidden">
                    {product.thumbnail_url ? (
                      <Image
                        src={product.thumbnail_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-pink-300 text-4xl">✦</span>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 bg-white/90 backdrop-blur text-pink-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {TYPE_LABEL[product.type]}
                    </span>
                  </div>

                  {/* 情報 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-pink-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                      {product.description}
                    </p>
                    <p className="text-lg font-black text-gray-900">
                      ¥{product.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      {/* フッター */}
      <footer className="border-t border-gray-100 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span className="font-bold text-pink-400">my shop</span>
          <div className="flex gap-6">
            <Link href="/legal" className="hover:text-gray-600 transition">特定商取引法</Link>
            <Link href="/privacy" className="hover:text-gray-600 transition">プライバシーポリシー</Link>
            <Link href="/terms" className="hover:text-gray-600 transition">利用規約</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
