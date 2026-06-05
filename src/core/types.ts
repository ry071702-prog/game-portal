import type { ComponentType } from 'react'
import { z } from 'zod'

/** ゲームのジャンル。新ジャンルはここに足すと一覧の絞り込みに自動反映される。 */
export const gameGenreSchema = z.enum(['puzzle', 'arcade', 'board'])
export type GameGenre = z.infer<typeof gameGenreSchema>

export const gameDifficultySchema = z.enum(['easy', 'normal', 'hard'])
export type GameDifficulty = z.infer<typeof gameDifficultySchema>

/**
 * 各ゲーム本体に共通枠 (GameShell) から渡される props。
 * ゲーム側はこれを受け取るだけで、ポーズ/リスタート/スコア表示の共通 UI に乗る。
 */
export interface GameComponentProps {
  /** true の間はゲームを停止する */
  paused: boolean
  /** 現在スコアを通知 → store の best と max 比較で更新 */
  onScore: (score: number) => void
  /** 終了を通知 → Shell が結果モーダル表示。'win' はクリア扱い (既定は 'over') */
  onGameOver: (result?: 'over' | 'win') => void
  /** インクリメントされたらリスタートする (useEffect の依存に入れる) */
  restartSignal: number
  /** デイリーチャレンジ時の seed。指定時はこの seed で盤面を生成し全員同一にする */
  seed?: number
}

export type GameComponent = ComponentType<GameComponentProps>

/** ゲーム1本のメタ情報。registry がこれを集約して一覧/ルートを生成する。 */
export interface GameManifest {
  /** URL slug。registry 内で一意 (^[a-z0-9-]+$) */
  id: string
  title: string
  genre: GameGenre
  /** 一覧カードの短い説明 */
  description: string
  /** 操作説明 (PC / モバイル)。GameShell のヘルプに表示 */
  instructions: string[]
  /** カードの絵文字サムネ (軽量・追加が楽)。将来 SVG/画像 URL に差し替え可 */
  thumbnail: string
  /** カードのアクセントカラー (Tailwind の任意値 or CSS color) */
  accentColor?: string
  difficulty?: GameDifficulty
  /** 目安プレイ時間 (分) */
  minutes?: number
  /** 人気・おすすめセクション用 */
  featured?: boolean
  /** 新着セクション用 */
  isNew?: boolean
  /** 遅延ロードでコード分割。ゲーム追加が一覧描画コストに影響しない */
  component: () => Promise<{ default: GameComponent }>
}

/** 関数フィールドを除いた検証用スキーマ (zod v4 は z.function を runtime parse しないため手動で typeof チェック) */
const manifestMetaSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'id は英小文字・数字・ハイフンのみ'),
  title: z.string().min(1),
  genre: gameGenreSchema,
  description: z.string().min(1),
  instructions: z.array(z.string()).min(1),
  thumbnail: z.string().min(1),
  accentColor: z.string().optional(),
  difficulty: gameDifficultySchema.optional(),
  minutes: z.number().positive().optional(),
  featured: z.boolean().optional(),
  isNew: z.boolean().optional(),
})

/**
 * registry 配列を検証し、id 重複を検出する。
 * 不正があれば throw して開発時に即座に気付けるようにする。
 */
export function validateRegistry(raw: GameManifest[]): GameManifest[] {
  const seen = new Set<string>()
  for (const m of raw) {
    manifestMetaSchema.parse(m)
    if (typeof m.component !== 'function') {
      throw new Error(`Game "${m.id}": component は () => import(...) の関数である必要があります`)
    }
    if (seen.has(m.id)) {
      throw new Error(`Game id が重複しています: "${m.id}"`)
    }
    seen.add(m.id)
  }
  return raw
}
