'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white border-b border-pink-100 sticky top-0 z-50 shadow-sm shadow-pink-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-md shadow-pink-200">
            <span className="text-white text-sm font-black">S</span>
          </div>
          <span className="text-xl font-black tracking-tight text-gray-900">
            my<span className="text-pink-500">shop</span>
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-pink-500 transition px-3 py-2 rounded-xl hover:bg-pink-50"
              >
                マイページ
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-gray-400 hover:text-gray-600 transition px-3 py-2 rounded-xl hover:bg-gray-50"
              >
                ログアウト
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-5 py-2 rounded-full text-sm font-semibold transition shadow-md shadow-pink-200"
            >
              ログイン
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
