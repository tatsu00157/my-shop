import Link from 'next/link'
import Image from 'next/image'
import { supabaseAdmin } from '@/lib/supabase'
import { DeleteProductButton } from './components/DeleteProductButton'
import { ToggleActiveButton } from './components/ToggleActiveButton'
import type { Product } from '@/types'
import { TYPE_LABEL } from '@/types'

async function getAllProducts(): Promise<Product[]> {
  const { data } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function AdminPage() {
  const products = await getAllProducts()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">商品管理</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length}件の商品</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-md shadow-pink-200"
        >
          + 新規商品を追加
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <p className="text-gray-400 mb-4">商品がまだありません</p>
          <Link
            href="/admin/products/new"
            className="text-pink-500 hover:underline text-sm font-medium"
          >
            最初の商品を追加する →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">商品</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">タイプ</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">価格</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">状態</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-pink-50 shrink-0 relative">
                        {product.thumbnail_url ? (
                          <Image src={product.thumbnail_url} alt={product.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-pink-200">✦</div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-pink-50 text-pink-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {TYPE_LABEL[product.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">
                    ¥{product.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <ToggleActiveButton
                      productId={product.id}
                      isActive={product.is_active}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-xs font-medium text-gray-500 hover:text-pink-500 px-3 py-1.5 rounded-lg hover:bg-pink-50 transition"
                      >
                        編集
                      </Link>
                      <DeleteProductButton productId={product.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
