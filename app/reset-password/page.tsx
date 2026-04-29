'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  if (!token) {
    return <p className="text-red-500 text-sm">無効なリンクです。</p>
  }

  if (done) {
    return (
      <div>
        <p className="text-2xl mb-3">✅</p>
        <p className="font-bold text-gray-900 mb-1">パスワードを更新しました</p>
        <p className="text-sm text-gray-500 mb-6">新しいパスワードでログインしてください</p>
        <Link
          href="/login"
          className="bg-pink-500 hover:bg-pink-600 text-white rounded-2xl px-6 py-3 font-semibold text-sm transition inline-block"
        >
          ログインする
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('パスワードが一致しません')
      return
    }
    if (password.length < 8) {
      setError('パスワードは8文字以上にしてください')
      return
    }

    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'エラーが発生しました')
      setLoading(false)
      return
    }

    setDone(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-left">
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="新しいパスワード（8文字以上）"
        required
        className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
      />
      <input
        type="password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        placeholder="パスワード（確認）"
        required
        className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-2xl px-4 py-3 font-semibold text-sm transition disabled:opacity-50"
      >
        {loading ? '更新中...' : 'パスワードを更新'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-white">
      <div className="bg-white rounded-3xl shadow-xl shadow-pink-100 p-10 w-full max-w-sm text-center">
        <p className="text-3xl font-black bg-gradient-to-r from-pink-500 to-pink-400 bg-clip-text text-transparent mb-2">
          my shop
        </p>
        <h1 className="text-lg font-bold text-gray-900 mb-6">新しいパスワードを設定</h1>
        <Suspense fallback={<p className="text-sm text-gray-400">読み込み中...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
