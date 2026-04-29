import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return Response.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const { productId } = await request.json()
  if (!productId) {
    return Response.json({ error: 'productId が必要です' }, { status: 400 })
  }

  // 商品情報を取得
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('is_active', true)
    .single()

  if (error || !product) {
    return Response.json({ error: '商品が見つかりません' }, { status: 404 })
  }

  // 購入済みチェック
  const { data: existing } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_email', session.user.email)
    .eq('product_id', productId)
    .eq('status', 'completed')
    .single()

  if (existing) {
    return Response.json({ error: 'この商品はすでに購入済みです' }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price: product.stripe_price_id,
        quantity: 1,
      },
    ],
    customer_email: session.user.email,
    metadata: {
      productId: product.id,
      userEmail: session.user.email,
    },
    success_url: `${siteUrl}/dashboard?success=1`,
    cancel_url: `${siteUrl}/products/${product.id}?canceled=1`,
  })

  return Response.json({ url: checkoutSession.url })
}
