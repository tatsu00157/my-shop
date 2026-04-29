'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ToggleActiveButton({ productId, isActive }: { productId: string; isActive: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-xs font-semibold px-2.5 py-1 rounded-full transition disabled:opacity-50 ${
        isActive
          ? 'bg-green-50 text-green-600 hover:bg-green-100'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
      }`}
    >
      {isActive ? '販売中' : '非公開'}
    </button>
  )
}
