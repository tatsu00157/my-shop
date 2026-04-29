'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          My Shop
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {session ? (
            <>
              <Link href="/dashboard" className="hover:underline">
                ダッシュボード
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-500 hover:underline"
              >
                ログアウト
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="bg-black text-white px-4 py-1.5 rounded-lg text-sm hover:bg-gray-800 transition"
            >
              ログイン
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
