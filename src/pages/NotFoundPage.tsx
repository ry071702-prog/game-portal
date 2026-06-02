import { Link } from 'react-router-dom'
import { Layout } from '../core/ui/Layout'

export default function NotFoundPage() {
  return (
    <Layout showBack>
      <div className="py-20 text-center">
        <p className="font-pixel neon-text mb-4 text-4xl text-fuchsia-400">404</p>
        <p className="mb-6 text-gray-400">ゲームが見つかりませんでした。</p>
        <Link
          to="/"
          className="rounded-xl border border-cyan-400/50 bg-cyan-500/20 px-5 py-2.5 font-bold text-cyan-100 hover:bg-cyan-500/30"
        >
          一覧へ戻る
        </Link>
      </div>
    </Layout>
  )
}
