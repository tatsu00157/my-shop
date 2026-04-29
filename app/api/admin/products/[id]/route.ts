import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

function isAdmin(email: string | null | undefined) {
  return email && email === process.env.ADMIN_EMAIL
}

// 商品更新
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<'/api/admin/products/[id]'>
) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user?.email)) {
    return Response.json({ error: '権限がありません' }, { status: 403 })
  }

  const { id } = await ctx.params
  const body = await request.json()
  const { name, description, price, type, stripe_price_id, thumbnail_url, file_key, is_active } = body

  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ name, description, price: Number(price), type, stripe_price_id, thumbnail_url, file_key, is_active })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}

// 商品削除
export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/admin/products/[id]'>
) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user?.email)) {
    return Response.json({ error: '権限がありません' }, { status: 403 })
  }

  const { id } = await ctx.params

  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}
