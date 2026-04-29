'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-pink-500 to-pink-400 bg-clip-text text-transparent">
            my shop
          </span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-pink-500 transition font-medium"
              >
                マイページ
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-400 hover:text-gray-600 transition text-sm"
              >
                ログアウト
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-full text-sm font-medium transition"
            >
              ログイン
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
