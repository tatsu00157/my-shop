'use client'

import { useState } from 'react'

export function DownloadButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const res = await fetch(`/api/downloads/${productId}`)
      const data = await res.json()
      if (data.url) {
        window.open(data.url, '_blank')
      } else {
        alert(data.error ?? 'ダウンロードURLの取得に失敗しました')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="shrink-0 bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
    >
      {loading ? '取得中...' : 'ダウンロード'}
    </button>
  )
}
