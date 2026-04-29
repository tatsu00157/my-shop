import { redirect } from 'next/navigation'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { Header } from '@/components/Header'
import { DownloadButton } from './DownloadButton'
import type { Purchase } from '@/types'
import { TYPE_LABEL } from '@/types'

async function getPurchases(email: string): Promise<Purchase[]> {
  const { data } = await supabaseAdmin
    .from('purchases')
    .select('*, product:products(*)')
    .eq('user_email', email)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect('/login')
  }

  const purchases = await getPurchases(session.user.email)

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12 flex-1">
        <div className="mb-10">
          <h1 className="text-2xl font-black text-gray-900 mb-1">マイページ</h1>
          <p className="text-sm text-gray-400">{session.user.email}</p>
        </div>

        <h2 className="text-base font-bold text-gray-700 mb-4">
          購入済みコンテンツ
          <span className="ml-2 text-sm font-normal text-gray-400">
            {purchases.length}件
          </span>
        </h2>

        {purchases.length === 0 ? (
          <div className="border-2 border-dashed border-pink-100 rounded-2xl p-16 text-center">
            <p className="text-4xl mb-4">✦</p>
            <p className="text-gray-400 font-medium">購入済みのコンテンツはありません</p>
            <a
              href="/"
              className="inline-block mt-4 text-pink-500 hover:underline text-sm font-medium"
            >
              商品を見る →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition"
              >
                {/* サムネイル */}
                <div className="aspect-video bg-gradient-to-br from-pink-50 to-pink-100 relative">
                  {purchase.product?.thumbnail_url ? (
                    <Image
                      src={purchase.product.thumbnail_url}
                      alt={purchase.product.name ?? ''}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-pink-300 text-3xl">✦</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <span className="inline-block bg-pink-50 text-pink-500 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
                    {purchase.product?.type ? TYPE_LABEL[purchase.product.type] : ''}
                  </span>
                  <p className="font-bold text-gray-900 mb-1">
                    {purchase.product?.name}
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    {new Date(purchase.created_at).toLocaleDateString('ja-JP')} 購入
                  </p>

                  {purchase.product?.type === 'download' && (
                    <DownloadButton productId={purchase.product_id} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
