import type { GameManifest } from '../../core/types'

const manifest: GameManifest = {
  id: 'slide15',
  title: '15パズル',
  genre: 'puzzle',
  description: 'タイルをスライドして1〜15を順番に並べる定番パズル。少手数を目指そう。',
  instructions: [
    '空きマスに隣接するタイルをタップ/クリックでスライド',
    '1〜15を順番に並べるとクリア',
    '手数が少ないほど高スコア',
  ],
  thumbnail: '🔢',
  accentColor: 'rgba(139, 92, 246, 0.15)',
  component: () => import('./Slide15'),
}

export default manifest
