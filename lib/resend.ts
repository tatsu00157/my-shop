import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)

const FROM = process.env.RESEND_FROM_EMAIL!

// ダウンロード購入完了メール
export async function sendDownloadPurchaseEmail(
  to: string,
  productName: string,
  downloadUrl: string
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `【購入完了】${productName}`,
    html: `
      <h2>ご購入ありがとうございます</h2>
      <p>「${productName}」のご購入が完了しました。</p>
      <p>以下のリンクからダウンロードしてください（1時間以内に有効）：</p>
      <p><a href="${downloadUrl}">${downloadUrl}</a></p>
      <p>ダッシュボードからいつでも再ダウンロードできます。</p>
    `,
  })
}

// SaaS・コンテンツ購入完了メール
export async function sendAccessGrantedEmail(
  to: string,
  productName: string,
  dashboardUrl: string
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `【購入完了】${productName}`,
    html: `
      <h2>ご購入ありがとうございます</h2>
      <p>「${productName}」のご購入が完了しました。</p>
      <p>以下のダッシュボードからアクセスしてください：</p>
      <p><a href="${dashboardUrl}">${dashboardUrl}</a></p>
    `,
  })
}
