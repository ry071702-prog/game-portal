import { Link } from 'react-router-dom'
import { Layout } from '../core/ui/Layout'

export default function NotFoundPage() {
  return (
    <Layout showBack>
      <div className="py-20 text-center">
        <p className="font-display neon-text mb-4 text-4xl text-fuchsia-600 dark:text-fuchsia-400">
          404
        </p>
        <p className="mb-6 text-muted">ゲームが見つかりませんでした。</p>
        <Link
          to="/"
          className="rounded-xl border border-[#ffe000]/50 bg-[#ffe000]/20 px-5 py-2.5 font-bold text-accent hover:bg-[#ffe000]/30 dark:text-black"
        >
          一覧へ戻る
        </Link>
      </div>
    </Layout>
  )
}
