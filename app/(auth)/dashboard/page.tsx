import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { Header } from '@/components/Header'
import { DownloadButton } from './DownloadButton'
import type { Purchase } from '@/types'

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
      <main className="max-w-3xl mx-auto px-4 py-12 flex-1">
        <h1 className="text-2xl font-bold mb-2">ダッシュボード</h1>
        <p className="text-gray-500 text-sm mb-8">{session.user.email}</p>

        {purchases.length === 0 ? (
          <div className="border border-gray-200 rounded-2xl p-10 text-center text-gray-400">
            <p>購入済みのコンテンツはありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="border border-gray-200 rounded-2xl p-6 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    {purchase.product?.type}
                  </p>
                  <p className="font-semibold">{purchase.product?.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {new Date(purchase.created_at).toLocaleDateString('ja-JP')} 購入
                  </p>
                </div>
                {purchase.product?.type === 'download' && (
                  <DownloadButton productId={purchase.product_id} />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
