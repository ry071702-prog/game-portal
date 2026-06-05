import type { GameManifest } from '../../core/types'

const manifest: GameManifest = {
  id: 'breakout',
  title: 'ブロック崩し',
  genre: 'arcade',
  description: 'パドルでボールを跳ね返してブロックを全消し。消すほど加速。',
  instructions: [
    'PC: ←→ キー、またはマウスでパドル移動',
    'スマホ: 画面をドラッグしてパドル移動',
    'ブロック1個で10点。全消しで次レベル(加速)',
  ],
  thumbnail: '🧱',
  accentColor: 'rgba(244, 63, 94, 0.15)',
  difficulty: 'normal',
  minutes: 5,
  component: () => import('./BreakoutGame'),
}

export default manifest
