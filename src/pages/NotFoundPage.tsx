import { Link } from 'react-router-dom'
import { Layout } from '../core/ui/Layout'

export default function NotFoundPage() {
  return (
    <Layout showBack>
      <div className="py-20 text-center">
        <p className="mb-2 text-4xl font-bold text-white">404</p>
        <p className="mb-6 text-gray-400">ゲームが見つかりませんでした。</p>
        <Link
          to="/"
          className="rounded-xl bg-violet-600 px-5 py-2.5 font-semibold text-white hover:bg-violet-500"
        >
          一覧へ戻る
        </Link>
      </div>
    </Layout>
  )
}
