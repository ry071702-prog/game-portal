import type { GameManifest } from '../../core/types'

const manifest: GameManifest = {
  id: 'stack',
  title: 'スタックタワー',
  genre: 'arcade',
  category: 'Action',
  description: '左右に動くブロックをタイミングよく落として積み上げる。ズレた分は削れていくワンタップゲーム。',
  instructions: [
    'PC: スペース / クリック・スマホ: 盤面をタップでブロックを落とす',
    '下の段からはみ出た部分は削れて、次のブロックが細くなる',
    'ぴったり重ねると PERFECT。3連続ごとに幅が少し戻る。積んだ段数がスコア',
  ],
  thumbnail: '🏗️',
  accentColor: 'rgba(56, 189, 248, 0.15)',
  difficulty: 'easy',
  minutes: 2,
  isNew: true,
  popularity: 80,
  component: () => import('./StackGame'),
}

export default manifest
