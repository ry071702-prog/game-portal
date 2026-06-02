import type { GameManifest } from '../../core/types'

const manifest: GameManifest = {
  id: 'simon',
  title: 'サイモン',
  genre: 'board',
  description: '光る順番を記憶して再現。ラウンドごとに1手ずつ増える記憶ゲーム。',
  instructions: [
    'パッドが光る順番を覚えます',
    '同じ順番でタップして再現',
    '成功するごとに1手増加。続いた回数がスコア',
  ],
  thumbnail: '🎺',
  accentColor: 'rgba(34, 197, 94, 0.15)',
  component: () => import('./SimonGame'),
}

export default manifest
