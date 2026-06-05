import type { GameManifest } from '../../core/types'

const manifest: GameManifest = {
  id: 'flap',
  title: 'フラッピー',
  genre: 'arcade',
  description: 'タップで羽ばたいて土管の隙間をくぐる。通過した数がスコア。',
  instructions: [
    'タップ / クリック / スペースで上昇',
    '土管の隙間をくぐる',
    'くぐった数がスコア。床・天井・土管に当たると終了',
  ],
  thumbnail: '🐤',
  accentColor: 'rgba(253, 224, 71, 0.15)',
  difficulty: 'normal',
  minutes: 2,
  isNew: true,
  component: () => import('./FlapGame'),
}

export default manifest
