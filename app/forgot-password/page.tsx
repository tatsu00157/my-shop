'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-white">
      <div className="bg-white rounded-3xl shadow-xl shadow-pink-100 p-10 w-full max-w-sm text-center">
        <p className="text-3xl font-black bg-gradient-to-r from-pink-500 to-pink-400 bg-clip-text text-transparent mb-2">
          my shop
        </p>
        <h1 className="text-lg font-bold text-gray-900 mb-1">パスワードをリセット</h1>

        {sent ? (
          <div className="mt-6">
            <p className="text-2xl mb-3">📧</p>
            <p className="font-bold text-gray-900 mb-1">メールを送信しました</p>
            <p className="text-sm text-gray-500 mb-6">
              {email} にリセット用リンクを送りました。<br />
              届かない場合は迷惑メールフォルダをご確認ください。
            </p>
            <Link href="/login" className="text-pink-500 text-sm font-semibold hover:text-pink-600">
              ログインページに戻る
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-8">
              登録済みのメールアドレスを入力してください。<br />
              パスワードリセット用のリンクを送信します。
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="メールアドレス"
                required
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-2xl px-4 py-3 font-semibold text-sm transition disabled:opacity-50"
              >
                {loading ? '送信中...' : 'リセットリンクを送信'}
              </button>
            </form>
            <p className="mt-6 text-sm text-gray-500">
              <Link href="/login" className="text-pink-500 font-semibold hover:text-pink-600">
                ログインページに戻る
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
