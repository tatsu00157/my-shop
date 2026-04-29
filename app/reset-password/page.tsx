'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  )
}

function PasswordRequirements({ password }: { password: string }) {
  const rules = [
    { label: '8文字以上', ok: password.length >= 8 },
    { label: '英字を含む', ok: /[a-zA-Z]/.test(password) },
    { label: '数字を含む', ok: /[0-9]/.test(password) },
  ]
  if (!password) return null
  return (
    <div className="flex gap-2 flex-wrap">
      {rules.map(r => (
        <span
          key={r.label}
          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
            r.ok ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}
        >
          <span>{r.ok ? '✓' : '·'}</span>
          {r.label}
        </span>
      ))}
    </div>
  )
}

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
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

    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('パスワードの要件を満たしてください')
      return
    }
    if (password !== confirm) { setError('パスワードが一致しません'); return }

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
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="新しいパスワード"
          required
          className="w-full border border-gray-200 rounded-2xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => setShowPassword(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          tabIndex={-1}
        >
          <EyeIcon open={showPassword} />
        </button>
      </div>

      <PasswordRequirements password={password} />

      <div className="relative">
        <input
          type={showConfirm ? 'text' : 'password'}
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="パスワード（確認）"
          required
          className="w-full border border-gray-200 rounded-2xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => setShowConfirm(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          tabIndex={-1}
        >
          <EyeIcon open={showConfirm} />
        </button>
      </div>
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
