import type { GameManifest } from '../../core/types'

const manifest: GameManifest = {
  id: 'memory',
  title: '神経衰弱',
  genre: 'board',
  category: 'Casual',
  description: '同じ絵柄のペアを揃える記憶ゲーム。少ない手数を目指そう。',
  instructions: [
    'カードをタップ/クリックして2枚めくる',
    '絵柄が一致するとペア成立、しなければ伏せ戻ります',
    '全ペアを揃えるとクリア。手数が少ないほど高スコア',
  ],
  thumbnail: '🃏',
  accentColor: 'rgba(245, 158, 11, 0.15)',
  difficulty: 'easy',
  minutes: 3,
  featured: true,
  popularity: 90,
  component: () => import('./MemoryGame'),
}

export default manifest
