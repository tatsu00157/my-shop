import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { sendDownloadPurchaseEmail, sendAccessGrantedEmail } from '@/lib/resend'
import { createPresignedDownloadUrl } from '@/lib/r2'
import type Stripe from 'stripe'

// Stripe Webhookはbodyの生データが必要なのでパース設定を無効化
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return Response.json({ error: 'シグネチャがありません' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return Response.json({ error: 'Webhook署名の検証に失敗しました' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const userEmail = session.metadata?.userEmail
    const productId = session.metadata?.productId

    if (!userEmail || !productId) {
      return Response.json({ error: 'メタデータが不足しています' }, { status: 400 })
    }

    // 重複処理防止（stripe_session_id がユニーク制約のため）
    const { error: insertError } = await supabaseAdmin
      .from('purchases')
      .insert({
        user_email: userEmail,
        product_id: productId,
        stripe_session_id: session.id,
        status: 'completed',
      })

    if (insertError) {
      // すでに処理済みの場合はスキップ
      if (insertError.code === '23505') {
        return Response.json({ received: true })
      }
      console.error('purchases insert error:', insertError)
      return Response.json({ error: 'DB保存に失敗しました' }, { status: 500 })
    }

    // 商品情報を取得
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (!product) {
      return Response.json({ error: '商品が見つかりません' }, { status: 500 })
    }

    const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`

    // 販売タイプ別のメール送信
    if (product.type === 'download' && product.file_key) {
      const downloadUrl = await createPresignedDownloadUrl(product.file_key)
      await sendDownloadPurchaseEmail(userEmail, product.name, downloadUrl)
    } else {
      await sendAccessGrantedEmail(userEmail, product.name, dashboardUrl)
    }
  }

  return Response.json({ received: true })
}
