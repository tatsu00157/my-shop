import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToR2, getPublicUrl } from '@/lib/r2'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return Response.json({ error: '権限がありません' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File
  const uploadType = formData.get('type') as string // 'thumbnail' | 'image' | 'download'

  if (!file) {
    return Response.json({ error: 'ファイルがありません' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'bin'
  const key = `${uploadType}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  await uploadToR2(key, buffer, file.type)

  // ダウンロードファイルはkeyのみ返す（署名付きURLで配信）
  if (uploadType === 'download') {
    return Response.json({ key })
  }

  // 画像はパブリックURLを返す
  return Response.json({ url: getPublicUrl(key), key })
}
