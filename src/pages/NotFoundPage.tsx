import { Link } from 'react-router-dom'
import { Layout } from '../core/ui/Layout'

export default function NotFoundPage() {
  return (
    <Layout showBack>
      <div className="rise-in my-8 rounded-3xl border border-line bg-bg-panel px-6 py-16 text-center">
        <p className="font-display mb-3 text-6xl text-fg">404</p>
        <p className="mb-6 text-sm font-bold text-muted">ゲームが見つかりませんでした。</p>
        <Link
          to="/"
          className="btn-primary"
        >
          一覧へ戻る
        </Link>
      </div>
    </Layout>
  )
}
