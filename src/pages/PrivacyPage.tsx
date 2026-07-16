import type { ReactNode } from 'react'
import { Layout } from '../core/ui/Layout'
import { Seo } from '../core/ui/Seo'

interface SectionProps {
  title: string
  children: ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="font-display text-2xl text-fg">{title}</h2>
      <div className="mt-3 space-y-3 text-sm font-bold leading-7 text-muted">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <Layout showBack>
      <Seo
        title="プライバシーポリシー — Game Portal"
        description="Game Portal のプライバシーポリシー  広告配信・データの取り扱い・お問い合わせ先について"
      />

      <div className="rise-in my-8 rounded-3xl border border-line bg-bg-panel px-6 py-10 sm:px-10">
        <p className="text-xs font-black tracking-[0.2em] text-cyan uppercase">Privacy Policy</p>
        <h1 className="font-display mt-2 text-3xl text-fg sm:text-4xl">プライバシーポリシー</h1>
        <p className="mt-3 text-sm font-bold leading-6 text-muted">
          本ページでは、Game Portal (以下「当サイト」) における情報の取り扱いについて説明します
        </p>

        <div className="mt-10">
          <Section title="広告配信について">
            <p>
              当サイトでは、第三者配信の広告サービス「Google AdSense」の導入を予定しています
              広告配信事業者は、ユーザーの興味に応じた広告を表示するために cookie
              や広告識別子を使用することがあります
            </p>
            <p>
              cookie を利用したパーソナライズ広告は、
              <a
                className="focus-ring rounded text-cyan underline underline-offset-4 hover:text-fg"
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google の広告に関するポリシー
              </a>
              のページから無効化 (オプトアウト) できます
            </p>
          </Section>

          <Section title="アクセス解析について">
            <p>
              当サイトは現在、個人を特定するアクセス解析ツールを使用していません
              導入する場合は本ページを更新してお知らせします
            </p>
          </Section>

          <Section title="データの保存について">
            <p>
              ゲームのスコアや設定は、原則としてお使いのブラウザ内 (ローカルストレージ)
              にのみ保存されます  ランキングに参加した場合は、入力したニックネームとスコアが
              サーバーに保存され、他のユーザーにも表示されます
            </p>
          </Section>

          <Section title="免責事項">
            <p>
              当サイトのコンテンツは正確性の維持に努めていますが、その内容を保証するものではありません
              当サイトの利用により生じた損害について、運営者は責任を負いかねます
            </p>
          </Section>

          <Section title="お問い合わせ">
            <p>
              本ポリシーに関するお問い合わせは、GitHub (
              <a
                className="focus-ring rounded text-cyan underline underline-offset-4 hover:text-fg"
                href="https://github.com/ry071702-prog"
                target="_blank"
                rel="noopener noreferrer"
              >
                ry071702-prog
              </a>
              ) までお願いします
            </p>
            <p className="text-xs text-faint">最終更新日: 2026年7月16日</p>
          </Section>
        </div>
      </div>
    </Layout>
  )
}
