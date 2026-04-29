import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// クライアント側（RLS適用）
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// サーバー側（RLSバイパス）- Webhook等の信頼できるサーバー処理のみで使用
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
