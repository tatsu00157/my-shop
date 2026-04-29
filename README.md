# デジタルコンテンツ販売プラットフォーム

個人が開発したアプリ・ツール・画像・デジタルコンテンツを販売するWebサイト。  
将来的にマーケットプレイス（複数販売者）への拡張を前提とした設計。

---

## 技術スタック

| 役割 | 技術 | 備考 |
|---|---|---|
| フロントエンド | Next.js (App Router) | UI・販売ページ |
| スタイリング | Tailwind CSS | - |
| 認証 | NextAuth.js | 購入者ログイン管理 |
| 決済 | Stripe Checkout | 初期はシンプル構成 |
| DB | Supabase (PostgreSQL) | 無料枠あり |
| ファイル置き場 | Cloudflare R2 | 無料枠10GB/月 |
| メール送信 | Resend | 無料枠3,000通/月 |
| ホスティング | Vercel | 個人利用は無料 |

---

## ディレクトリ構成

```
/
├── app/
│   ├── (public)/              # 認証不要のページ
│   │   ├── page.tsx           # トップ・商品一覧
│   │   └── products/
│   │       └── [id]/
│   │           └── page.tsx   # 商品詳細・購入ページ
│   ├── (auth)/                # 認証が必要なページ
│   │   └── dashboard/
│   │       └── page.tsx       # 購入済みコンテンツ一覧
│   └── api/
│       ├── webhooks/
│       │   └── stripe/
│       │       └── route.ts   # Stripe Webhook受信（決済完了処理の起点）
│       └── downloads/
│           └── [productId]/
│               └── route.ts   # 署名付きダウンロードURL発行
├── components/                # 共通UIコンポーネント
├── lib/
│   ├── stripe.ts              # Stripe初期化
│   ├── supabase.ts            # Supabase初期化
│   ├── r2.ts                  # Cloudflare R2初期化
│   └── resend.ts              # メール送信
└── types/                     # 型定義
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
| file_key | text | R2上のファイルパス（ダウンロード系のみ） |
| stripe_price_id | text | StripeのPrice ID |
| is_active | boolean | 販売中かどうか |
| created_at | timestamp | - |

### purchases（購入履歴）

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid | 主キー |
| user_id | uuid | 購入者のユーザーID |
| product_id | uuid | 商品ID |
| stripe_session_id | text | StripeセッションID（重複防止用） |
| status | text | `pending` / `completed` / `refunded` |
| created_at | timestamp | - |

### users（購入者）

NextAuth.js が自動管理。購入者のメール・セッション情報を保持。

---

## 販売物ごとの「使える状態にする」処理

### ① ダウンロード販売（アプリ・ツール・画像など）

```
Webhook受信
  → purchases テーブルに status: completed で保存
  → ダウンロードページのURLをメールで送信
  → /api/downloads/[productId] でR2の署名付きURLを発行（期限付き）
```

- ファイルはR2に置き、直リンクは公開しない
- 署名付きURLは1時間などの有効期限を設定する

### ② Webシステム・SaaS

```
Webhook受信
  → purchases テーブルに status: completed で保存
  → users テーブルの plan / is_active フラグを更新
  → アクセス権が付与されたことをメールで通知
```

- ログイン後のダッシュボードでシステムにアクセス可能になる

### ③ デジタルコンテンツ閲覧（動画・テキスト・記事など）

```
Webhook受信
  → purchases テーブルに status: completed で保存
  → ダッシュボードのコンテンツ一覧に自動で追加
```

- 購入前はプレビューのみ、購入後に全文・全動画を解放する

---

## 決済フロー（Stripe Checkout）

```
1. ユーザーが「購入する」をクリック
2. サーバーがStripe Checkout Sessionを作成
3. StripeのチェックアウトページにリダイレクT
4. ユーザーがカード情報を入力・決済
5. Stripeが /api/webhooks/stripe にイベントを送信
6. サーバーが purchases テーブルを更新
7. 販売物の種類に応じた処理を実行
8. 購入者にメール送信
```

**注意：** 決済完了の判定は必ずWebhookで行う。  
リダイレクトURLのパラメータだけを信頼するのはセキュリティ上NG。

---

## 環境変数（.env.local）

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...

# Resend（メール）
RESEND_API_KEY=...

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=...
```

---

## 将来のマーケットプレイス拡張時の変更点

現在の設計はマーケットプレイス拡張を前提にしているため、以下を追加するだけで対応可能。

- Stripe → **Stripe Connect** に切り替え
- `products` テーブルに `seller_id` カラムを追加
- 販売者登録・ダッシュボード画面を追加
- 売上・手数料の管理機能を追加

---

## 法律面チェックリスト

- [ ] 特定商取引法に基づく表示ページを作成（住所・氏名・返金ポリシーなど）
- [ ] プライバシーポリシーを作成
- [ ] 利用規約を作成
- [ ] 返金・キャンセルポリシーを明記
