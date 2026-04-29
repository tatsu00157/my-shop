'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ProductImage } from '@/types'

export function ImageGallery({ images }: { images: ProductImage[] }) {
  const [selected, setSelected] = useState(0)

  if (images.length === 0) return null

  return (
    <div className="space-y-3">
      {/* メイン画像 */}
      <div className="aspect-video relative rounded-2xl overflow-hidden bg-pink-50">
        <Image
          src={images[selected].url}
          alt=""
          fill
          className="object-cover"
        />
      </div>

      {/* サムネイル一覧 */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelected(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                i === selected ? 'border-pink-500' : 'border-transparent hover:border-pink-200'
              }`}
            >
              <div className="relative w-full h-full">
                <Image src={img.url} alt="" fill className="object-cover" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
