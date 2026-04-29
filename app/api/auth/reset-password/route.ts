import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()

  if (!token || !password) {
    return NextResponse.json({ error: '入力が不正です' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'パスワードは8文字以上にしてください' }, { status: 400 })
  }
  if (!/[a-zA-Z]/.test(password)) {
    return NextResponse.json({ error: 'パスワードに英字を含めてください' }, { status: 400 })
  }
  if (!/[0-9]/.test(password)) {
    return NextResponse.json({ error: 'パスワードに数字を含めてください' }, { status: 400 })
  }

  const { data: resetToken } = await supabaseAdmin
    .from('password_reset_tokens')
    .select('*')
    .eq('token', token)
    .single()

  if (!resetToken || new Date(resetToken.expires_at) < new Date()) {
    return NextResponse.json({ error: 'リセットリンクが無効または期限切れです' }, { status: 400 })
  }

  const password_hash = await bcrypt.hash(password, 12)

  await supabaseAdmin
    .from('users')
    .update({ password_hash })
    .eq('email', resetToken.user_email)

  await supabaseAdmin
    .from('password_reset_tokens')
    .delete()
    .eq('token', token)

  return NextResponse.json({ ok: true })
}
