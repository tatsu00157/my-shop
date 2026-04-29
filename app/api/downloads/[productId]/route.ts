import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { createPresignedDownloadUrl } from '@/lib/r2'

export async function GET(
  _req: Request,
  ctx: RouteContext<'/api/downloads/[productId]'>
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return Response.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const { productId } = await ctx.params

  // 購入済み確認
  const { data: purchase } = await supabaseAdmin
    .from('purchases')
    .select('id')
    .eq('user_email', session.user.email)
    .eq('product_id', productId)
    .eq('status', 'completed')
    .single()

  if (!purchase) {
    return Response.json({ error: '購入履歴が見つかりません' }, { status: 403 })
  }

  // 商品のファイルキーを取得
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('file_key, type')
    .eq('id', productId)
    .single()

  if (!product || product.type !== 'download' || !product.file_key) {
    return Response.json({ error: 'ダウンロード対象のファイルがありません' }, { status: 404 })
  }

  const downloadUrl = await createPresignedDownloadUrl(product.file_key)

  return Response.json({ url: downloadUrl })
}
