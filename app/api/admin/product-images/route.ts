import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

function isAdmin(email: string | null | undefined) {
  return email && email === process.env.ADMIN_EMAIL
}

// 商品画像を追加
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user?.email)) {
    return Response.json({ error: '権限がありません' }, { status: 403 })
  }

  const { product_id, url, sort_order } = await request.json()

  const { data, error } = await supabaseAdmin
    .from('product_images')
    .insert({ product_id, url, sort_order: sort_order ?? 0 })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}

// 商品画像を削除
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user?.email)) {
    return Response.json({ error: '権限がありません' }, { status: 403 })
  }

  const { id } = await request.json()

  const { error } = await supabaseAdmin
    .from('product_images')
    .delete()
    .eq('id', id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}
