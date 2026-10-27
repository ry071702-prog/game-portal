// カラーワード (ストループ課題): 「あか」と書かれた青い文字のように、文字の意味と色が食い違う問題に
// お題 (文字の「いろ」か「いみ」か) で答える。

export const DURATION = 30 // 秒
/** 誤答のペナルティ (残り時間から引く秒数) */
export const WRONG_PENALTY = 2

export const COLORS = [
  { key: 'red', label: 'あか', css: '#ef4444' },
  { key: 'blue', label: 'あお', css: '#3b82f6' },
  { key: 'green', label: 'みどり', css: '#22c55e' },
  { key: 'yellow', label: 'きいろ', css: '#facc15' },
] as const

export type ColorIndex = 0 | 1 | 2 | 3
/** 'ink' = 文字の色で答える / 'word' = 書いてある言葉で答える */
export type Rule = 'ink' | 'word'

export interface Question {
  /** 書かれている言葉 */
  word: ColorIndex
  /** 文字の色 */
  ink: ColorIndex
  rule: Rule
}

const pick = (rng: () => number): ColorIndex => Math.floor(rng() * COLORS.length) as ColorIndex

/**
 * 問題を1問作る。意味と色は 75% の確率で食い違わせる (一致ばかりだと簡単すぎる)。
 * お題は score が 50 点を超えるまでは「いろ」固定、以降は半々で混ぜる。
 */
export function makeQuestion(rng: () => number = Math.random, score = 0): Question {
  const word = pick(rng)
  let ink = word
  if (rng() < 0.75) {
    // word 以外の3色から選ぶ
    ink = ((word + 1 + Math.floor(rng() * (COLORS.length - 1))) % COLORS.length) as ColorIndex
  }
  const rule: Rule = score > 50 && rng() < 0.5 ? 'word' : 'ink'
  return { word, ink, rule }
}

export function correctAnswer(q: Question): ColorIndex {
  return q.rule === 'ink' ? q.ink : q.word
}

/** 連続正解数 streak (今回の正解を含む, 1以上) に応じた加点。5連続以降は +20 で頭打ち。 */
export function pointsFor(streak: number): number {
  return 10 + Math.min(Math.max(streak - 1, 0), 5) * 2
}

export interface ColorWordState {
  score: number
  streak: number
  correct: number
  wrong: number
}

export const initialState: ColorWordState = { score: 0, streak: 0, correct: 0, wrong: 0 }

/** 回答を採点した次の状態。誤答はスコアを減らさず連続正解だけリセット (時間ペナルティは UI 側)。 */
export function answer(s: ColorWordState, q: Question, choice: ColorIndex): { state: ColorWordState; ok: boolean } {
  if (choice === correctAnswer(q)) {
    const streak = s.streak + 1
    return {
      state: { ...s, streak, score: s.score + pointsFor(streak), correct: s.correct + 1 },
      ok: true,
    }
  }
  return { state: { ...s, streak: 0, wrong: s.wrong + 1 }, ok: false }
}
