import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: '入力が不正です' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'パスワードは8文字以上にしてください' }, { status: 400 })
  }

  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'このメールアドレスはすでに登録されています' }, { status: 409 })
  }

  const password_hash = await bcrypt.hash(password, 12)

  const { error } = await supabaseAdmin.from('users').insert({
    id: randomUUID(),
    email,
    password_hash,
  })

  if (error) {
    return NextResponse.json({ error: '登録に失敗しました' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
