@AGENTS.md

---

# プロジェクト: デジタルコンテンツ販売プラットフォーム

個人が開発したアプリ・ツール・画像・デジタルコンテンツを販売するWebサイト。
将来的にマーケットプレイス（複数販売者）への拡張を前提とした設計。

---

## Claudeへのルール

1. **ファイルを新規作成・修正する前に必ずユーザーに確認を取る**
2. **ファイルを修正・作成した後は必ずこのCLAUDE.mdを最新の状態に更新し、gitコミット＆プッシュもセットで行う**
3. README.mdを正とする。設計の疑問点はREADME.mdを参照する
4. 環境変数は `.env.local` に格納する。コードにハードコードしない
5. 決済完了の判定は必ずStripe Webhookで行う（リダイレクトURLのパラメータのみに依存しない）
6. `.env.local` は絶対にReadツールで読み込まない。機密情報が含まれるため

---

## 技術スタック

| 役割 | 技術 | 備考 |
|---|---|---|
| フロントエンド | Next.js 16.2.4 (App Router) | UI・販売ページ |
| スタイリング | Tailwind CSS v4 | |
| 認証 | NextAuth.js v4 | Google OAuth + JWT戦略 |
| 決済 | Stripe Checkout | APIバージョン: 2026-04-22.dahlia |
| DB | Supabase (PostgreSQL) | |
| ファイル置き場 | Cloudflare R2 | AWS S3互換 |
| メール送信 | Resend | ドメイン認証済み |
| ホスティング | VPS（自前） | Vercelではなく自前VPSに変更 |

---

## ディレクトリ構成

```
/
├── app/
│   ├── (public)/
│   │   └── products/
│   │       └── [id]/
│   │           ├── page.tsx          # 商品詳細・購入ページ
│   │           └── PurchaseButton.tsx
│   ├── (auth)/
│   │   └── dashboard/
│   │       ├── page.tsx              # 購入済みコンテンツ一覧
│   │       └── DownloadButton.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── checkout/route.ts         # Stripe Checkout Session生成
│   │   ├── webhooks/stripe/route.ts  # Stripe Webhook受信
│   │   └── downloads/[productId]/route.ts  # 署名付きURL発行
│   ├── login/page.tsx
│   ├── page.tsx                      # トップ・商品一覧
│   ├── layout.tsx
│   └── providers.tsx                 # SessionProvider
├── components/
│   └── Header.tsx
├── lib/
│   ├── auth.ts                       # NextAuth設定
│   ├── stripe.ts                     # Stripe初期化
│   ├── supabase.ts                   # Supabase（通常 + admin）
│   ├── r2.ts                         # R2署名付きURL発行
│   └── resend.ts                     # メール送信
└── types/
    └── index.ts                      # Product, Purchase型
```

---

## データベース設計（Supabase）

### products（商品）

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid | 主キー |
| name | text | 商品名 |
| description | text | 説明文 |
| price | integer | 価格（円） |
| type | text | `download` / `saas` / `content` |
| file_key | text | R2上のファイルパス（downloadのみ） |
| stripe_price_id | text | StripeのPrice ID |
| is_active | boolean | 販売中かどうか |
| created_at | timestamp | |

### purchases（購入履歴）

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid | 主キー |
| user_email | text | 購入者のメールアドレス |
| product_id | uuid | 商品ID |
| stripe_session_id | text | StripeセッションID（重複防止） |
| status | text | `pending` / `completed` / `refunded` |
| created_at | timestamp | |

---

## 販売タイプ別の処理

### ① download（ファイル販売）
- R2にファイルをアップロード、`file_key`にパスを設定
- 購入後：署名付きURL（1時間有効）をメールで送信
- ダッシュボードからいつでも再ダウンロード可能

### ② saas（WebシステムURL・ライセンスキー）
- `products`テーブルに`access_url`・`license_key`カラムが必要（未追加）
- 購入後：ダッシュボードにURL・ライセンスキーを表示

### ③ content（動画・記事・画像素材など）
- 購入前プレビュー・購入後フル表示の仕組みが必要（未実装）
- ダッシュボードにコンテンツビューワーを実装予定

---

## 環境変数（.env.local）

```env
# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Resend（メール送信）
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# サイト設定
NEXT_PUBLIC_SITE_URL=
```

---

## 実装ステータス

### 完了・動作確認済み
- [x] Next.js プロジェクト初期化
- [x] 全依存パッケージインストール
- [x] Supabase DBスキーマ（products / purchases）
- [x] 全環境変数設定済み
- [x] `lib/stripe.ts`
- [x] `lib/supabase.ts`
- [x] `lib/r2.ts`
- [x] `lib/resend.ts`
- [x] `lib/auth.ts`（Google OAuth）
- [x] `types/index.ts`
- [x] `app/layout.tsx` / `app/providers.tsx`
- [x] `components/Header.tsx`
- [x] `app/page.tsx`（商品一覧）
- [x] `app/login/page.tsx`
- [x] `app/api/auth/[...nextauth]/route.ts`
- [x] `app/api/checkout/route.ts`
- [x] `app/api/webhooks/stripe/route.ts`
- [x] `app/api/downloads/[productId]/route.ts`
- [x] `app/(public)/products/[id]/page.tsx`
- [x] `app/(auth)/dashboard/page.tsx`
- [x] デザイン全般（ピンク系・BOOTH風）
- [x] `app/(public)/products/[id]/ImageGallery.tsx`（複数画像ギャラリー）
- [x] `product_images`テーブル追加（Supabase済み）
- [x] `products.thumbnail_url`カラム追加（Supabase済み）
- [x] 管理画面（`/admin`）- 商品一覧・登録・編集・削除・公開切替
- [x] R2ファイルアップロードAPI（`/api/admin/upload`）
- [x] 商品CRUD API（`/api/admin/products`）
- [x] 商品画像API（`/api/admin/product-images`）
- [x] ADMIN_EMAILによる管理者アクセス制限
- [x] R2パブリックアクセス設定・R2_PUBLIC_URL環境変数
- [x] Stripe決済フロー（ローカル動作確認済み）
- [x] Webhook → DB保存（動作確認済み）
- [x] 購入完了メール送信（動作確認済み）

### 未実装
- [ ] 検索・絞り込み機能（商品一覧ページ）
- [ ] `products`テーブルに`access_url`・`license_key`カラム追加（saas対応）
- [ ] saasタイプのダッシュボード表示
- [ ] contentタイプのコンテンツビューワー
- [ ] 特定商取引法ページ
- [ ] プライバシーポリシーページ
- [ ] 利用規約ページ
- [ ] VPSデプロイ設定
- [ ] 本番用Stripe Webhook登録

---

## 設計上の変更点（READMEからの差異）

- `purchases.user_id uuid` → `purchases.user_email text`
  - 理由: NextAuth JWT戦略を採用しUUIDではなくメールアドレスで識別
- 認証: Google OAuth（NextAuth v4 + JWT戦略、DBアダプター不使用）
- `app/(public)/page.tsx` は作成せず `app/page.tsx` を使用
  - 理由: 同じルート `/` に複数のpage.tsxは作成不可
- ホスティング: VercelではなくVPS（自前サーバー）

---

## 将来のマーケットプレイス拡張

- Stripe → Stripe Connect に切り替え
- `products` テーブルに `seller_id` カラムを追加
- 販売者登録・ダッシュボード画面を追加
- 売上・手数料の管理機能を追加
