import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { resend } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ ok: true }) // メール列挙対策：常に成功を返す
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (!user) {
    return NextResponse.json({ ok: true }) // ユーザーが存在しなくても成功を返す
  }

  const token = randomBytes(32).toString('hex')
  const expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1時間

  await supabaseAdmin.from('password_reset_tokens').insert({
    token,
    user_email: email,
    expires_at,
  })

  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: 'パスワードリセットのご案内',
    html: `
      <h2>パスワードのリセット</h2>
      <p>以下のリンクからパスワードをリセットしてください。</p>
      <p>リンクの有効期限は1時間です。</p>
      <p><a href="${resetUrl}" style="color:#ec4899;font-weight:bold;">パスワードをリセットする</a></p>
      <p style="color:#9ca3af;font-size:12px;">このメールに心当たりがない場合は無視してください。</p>
    `,
  })

  return NextResponse.json({ ok: true })
}
