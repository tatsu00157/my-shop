import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

function isAdmin(email: string | null | undefined) {
  return email && email === process.env.ADMIN_EMAIL
}

// 商品一覧（管理者用・全件）
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user?.email)) {
    return Response.json({ error: '権限がありません' }, { status: 403 })
  }

  const { data } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return Response.json(data ?? [])
}

// 商品新規登録
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user?.email)) {
    return Response.json({ error: '権限がありません' }, { status: 403 })
  }

  const body = await request.json()
  const { name, description, price, type, stripe_price_id, thumbnail_url, file_key, is_active } = body

  if (!name || !price || !type || !stripe_price_id) {
    return Response.json({ error: '必須項目が不足しています' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({ name, description, price: Number(price), type, stripe_price_id, thumbnail_url, file_key, is_active: is_active ?? true })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}
