'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Product, ProductImage } from '@/types'

type Props = {
  product?: Product
  productImages?: ProductImage[]
}

export function ProductForm({ product, productImages = [] }: Props) {
  const router = useRouter()
  const isEdit = !!product

  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    type: product?.type ?? 'download',
    stripe_price_id: product?.stripe_price_id ?? '',
    is_active: product?.is_active ?? true,
    thumbnail_url: product?.thumbnail_url ?? '',
    file_key: product?.file_key ?? '',
  })

  const [images, setImages] = useState<ProductImage[]>(productImages)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  async function uploadFile(file: File, type: 'thumbnail' | 'image' | 'download') {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', type)
    setUploading(type)
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      return await res.json()
    } finally {
      setUploading(null)
    }
  }

  async function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await uploadFile(file, 'thumbnail')
    if (result.url) setForm(prev => ({ ...prev, thumbnail_url: result.url }))
  }

  async function handleDownloadFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await uploadFile(file, 'download')
    if (result.key) setForm(prev => ({ ...prev, file_key: result.key }))
  }

  async function handleProductImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (!product?.id) {
      alert('商品を先に保存してから画像を追加してください')
      return
    }
    for (const file of files) {
      const result = await uploadFile(file, 'image')
      if (result.url) {
        const res = await fetch('/api/admin/product-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: product.id, url: result.url, sort_order: images.length }),
        })
        const newImage = await res.json()
        setImages(prev => [...prev, newImage])
      }
    }
  }

  async function handleDeleteImage(id: string) {
    await fetch('/api/admin/product-images', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setImages(prev => prev.filter(img => img.id !== id))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const url = isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error ?? '保存に失敗しました')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">

      {/* 基本情報 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-bold text-gray-900">基本情報</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            商品名 <span className="text-pink-500">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="例：デザインテンプレートパック"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">説明</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="商品の説明を入力してください"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              価格（円） <span className="text-pink-500">*</span>
            </label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              required
              min="0"
              placeholder="1000"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              タイプ <span className="text-pink-500">*</span>
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white"
            >
              <option value="download">ダウンロード</option>
              <option value="saas">システム・SaaS</option>
              <option value="content">デジタルコンテンツ</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Stripe Price ID <span className="text-pink-500">*</span>
          </label>
          <input
            name="stripe_price_id"
            value={form.stripe_price_id}
            onChange={handleChange}
            required
            placeholder="price_..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            Stripeダッシュボード → 商品カタログ → 該当商品のPrice IDを入力
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="is_active"
            id="is_active"
            checked={form.is_active}
            onChange={handleChange}
            className="w-4 h-4 accent-pink-500"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            販売中にする
          </label>
        </div>
      </div>

      {/* サムネイル */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-bold text-gray-900">サムネイル画像</h2>
        <p className="text-xs text-gray-400">商品一覧・カードに表示されるメイン画像</p>

        {form.thumbnail_url && (
          <div className="relative w-48 h-28 rounded-xl overflow-hidden">
            <Image src={form.thumbnail_url} alt="サムネイル" fill className="object-cover" />
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, thumbnail_url: '' }))}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-black/70"
            >
              ×
            </button>
          </div>
        )}

        <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-4 cursor-pointer transition ${uploading === 'thumbnail' ? 'opacity-50' : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50'}`}>
          <span className="text-2xl text-gray-300">📷</span>
          <span className="text-sm text-gray-500">
            {uploading === 'thumbnail' ? 'アップロード中...' : '画像をクリックして選択'}
          </span>
          <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" disabled={!!uploading} />
        </label>
      </div>

      {/* 商品説明画像 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-bold text-gray-900">商品説明画像</h2>
        <p className="text-xs text-gray-400">
          商品詳細ページに表示される画像（複数可）
          {!isEdit && <span className="ml-1 text-orange-400">※商品を保存後に追加できます</span>}
        </p>

        {images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative w-24 h-24 rounded-xl overflow-hidden group">
                <Image src={img.url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img.id)}
                  className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-medium"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}

        {isEdit && (
          <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-4 cursor-pointer transition ${uploading === 'image' ? 'opacity-50' : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50'}`}>
            <span className="text-2xl text-gray-300">🖼️</span>
            <span className="text-sm text-gray-500">
              {uploading === 'image' ? 'アップロード中...' : '画像を追加（複数選択可）'}
            </span>
            <input type="file" accept="image/*" multiple onChange={handleProductImagesChange} className="hidden" disabled={!!uploading} />
          </label>
        )}
      </div>

      {/* ダウンロードファイル */}
      {form.type === 'download' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">ダウンロードファイル</h2>
          <p className="text-xs text-gray-400">購入者にダウンロードさせるファイル</p>

          {form.file_key && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm">
              <span>✓</span>
              <span className="font-mono text-xs">{form.file_key}</span>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, file_key: '' }))}
                className="ml-auto text-green-500 hover:text-green-700"
              >
                変更
              </button>
            </div>
          )}

          {!form.file_key && (
            <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-4 cursor-pointer transition ${uploading === 'download' ? 'opacity-50' : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50'}`}>
              <span className="text-2xl text-gray-300">📦</span>
              <span className="text-sm text-gray-500">
                {uploading === 'download' ? 'アップロード中...' : 'ファイルをクリックして選択'}
              </span>
              <input type="file" onChange={handleDownloadFileChange} className="hidden" disabled={!!uploading} />
            </label>
          )}
        </div>
      )}

      {/* 保存ボタン */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading || !!uploading}
          className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50 shadow-md shadow-pink-200"
        >
          {loading ? '保存中...' : isEdit ? '変更を保存' : '商品を登録'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="text-gray-500 hover:text-gray-700 px-4 py-3 rounded-xl transition"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
