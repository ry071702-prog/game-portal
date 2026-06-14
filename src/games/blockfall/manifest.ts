import type { GameManifest } from '../../core/types'

const manifest: GameManifest = {
  id: 'blockfall',
  title: 'ブロックフォール',
  genre: 'arcade',
  category: 'Puzzle',
  description: '7種のミノを積んでラインを消す定番落ち物パズル。消すほど加速。',
  instructions: [
    'PC: ←→ 移動 / ↑ または X で回転 / ↓ ソフトドロップ / Space ハードドロップ',
    'スマホ: 画面下のボタンで移動・回転・ドロップ',
    '1/2/3/4ライン同時消しで 100/300/500/800点 ×レベル。10ライン毎に加速',
  ],
  thumbnail: '🧱',
  accentColor: 'rgba(167, 139, 250, 0.15)',
  difficulty: 'normal',
  minutes: 6,
  featured: true,
  isNew: true,
  popularity: 90,
  component: () => import('./BlockfallGame'),
}

export default manifest
