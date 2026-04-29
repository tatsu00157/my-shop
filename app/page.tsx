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
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ヒーロー */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-pink-400 to-rose-400">
        {/* 装飾 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-pink-600/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-24 text-center">
          <span className="inline-block bg-white/20 backdrop-blur text-white text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            Digital Contents Shop
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight drop-shadow-sm">
            欲しいデジタル商品が<br className="hidden sm:block" />
            きっと見つかる
          </h1>
          <p className="text-pink-100 text-lg max-w-lg mx-auto mb-10">
            アプリ・ツール・素材・コンテンツなど<br />
            あらゆるデジタル商品を取り揃えています
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white/60" />
              ダウンロード販売
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white/60" />
              システム・SaaS
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white/60" />
              デジタルコンテンツ
            </span>
          </div>
        </div>
      </section>

      {/* 商品一覧 */}
      <main className="max-w-6xl mx-auto px-4 py-14">
        {products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">✦</p>
            <p className="text-gray-400 text-lg font-medium">現在販売中の商品はありません</p>
          </div>
        ) : (
          <>
            {/* ヘッダー（検索・絞り込みは今後追加） */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900">すべての商品</h2>
                <p className="text-sm text-gray-400 mt-0.5">{products.length}件の商品</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border border-gray-100"
                >
                  {/* サムネイル */}
                  <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50">
                    {product.thumbnail_url ? (
                      <Image
                        src={product.thumbnail_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-pink-200 text-5xl">✦</span>
                      </div>
                    )}
                    {/* タイプバッジ */}
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-pink-500 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                      {TYPE_LABEL[product.type]}
                    </span>
                  </div>

                  {/* 情報 */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-1.5 group-hover:text-pink-500 transition-colors leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-black text-gray-900">
                        ¥{product.price.toLocaleString()}
                      </p>
                      <span className="text-xs font-semibold text-pink-500 bg-pink-50 px-2.5 py-1 rounded-full group-hover:bg-pink-500 group-hover:text-white transition-colors">
                        詳細を見る
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                <span className="text-white text-xs font-black">S</span>
              </div>
              <span className="font-black text-gray-900">
                my<span className="text-pink-500">shop</span>
              </span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/legal" className="hover:text-pink-500 transition">特定商取引法</Link>
              <Link href="/privacy" className="hover:text-pink-500 transition">プライバシーポリシー</Link>
              <Link href="/terms" className="hover:text-pink-500 transition">利用規約</Link>
            </div>
          </div>
          <p className="text-center text-xs text-gray-300 mt-8">© 2026 myshop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
