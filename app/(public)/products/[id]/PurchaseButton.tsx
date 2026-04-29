'use client'

import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'

export function PurchaseButton({ productId }: { productId: string }) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  async function handlePurchase() {
    if (!session) {
      signIn('google')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error ?? '購入処理でエラーが発生しました')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="w-full bg-black text-white rounded-xl py-4 text-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
    >
      {loading ? '処理中...' : session ? '購入する' : 'ログインして購入する'}
    </button>
  )
}
