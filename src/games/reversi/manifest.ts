import type { GameManifest } from '../../core/types'

const manifest: GameManifest = {
  id: 'reversi',
  title: 'ミニリバーシ',
  genre: 'board',
  category: 'Strategy',
  description: '6×6 の小さな盤で CPU と対戦するリバーシ。1局2〜3分でサクッと遊べる。',
  instructions: [
    '点が表示されたマスをタップ/クリックして黒石を置く',
    '縦・横・斜めに挟んだ白石が黒に裏返る。打てる場所がなければ自動でパス',
    'あなたが先手 (黒)。勝つと 100 + 石差、引き分け 50、負けは自分の石数がスコア',
  ],
  thumbnail: '⚫',
  accentColor: 'rgba(16, 185, 129, 0.15)',
  difficulty: 'normal',
  minutes: 3,
  isNew: true,
  popularity: 75,
  component: () => import('./ReversiGame'),
}

export default manifest
