import type { GameManifest } from '../../core/types'

const manifest: GameManifest = {
  id: 'lightsout',
  title: 'ライツアウト',
  genre: 'puzzle',
  category: 'Puzzle',
  description: '光を全部消すパズル。押すと十字に反転。少ない手数を目指そう。',
  instructions: [
    'マスをタップ/クリックすると、そのマスと上下左右が反転します',
    'すべてのライトを消すとクリア',
    '手数が少ないほど高スコア',
  ],
  thumbnail: '💡',
  accentColor: 'rgba(253, 224, 71, 0.15)',
  difficulty: 'normal',
  minutes: 4,
  popularity: 72,
  component: () => import('./LightsOut'),
}

export default manifest
