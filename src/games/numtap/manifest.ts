import type { GameManifest } from '../../core/types'

const manifest: GameManifest = {
  id: 'numtap',
  title: '数字タッチ',
  genre: 'arcade',
  description: 'バラバラの1〜25を順番に素早くタップ。クリアタイムを競う反射神経ゲーム。',
  instructions: ['1から25まで順番にタップ/クリック', '間違えてもタイムは進みます', '速いほど高スコア'],
  thumbnail: '⏱️',
  accentColor: 'rgba(34, 211, 238, 0.15)',
  component: () => import('./NumTapGame'),
}

export default manifest
