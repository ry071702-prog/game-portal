export const CODE_LENGTH = 4
export const MAX_TURNS = 10

/** 0-9 から重複なしの CODE_LENGTH 桁の答えを生成 (純粋・rng注入可)。 */
export function makeAnswer(rng: () => number = Math.random): number[] {
  const digits = Array.from({ length: 10 }, (_, i) => i)
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[digits[i], digits[j]] = [digits[j], digits[i]]
  }
  return digits.slice(0, CODE_LENGTH)
}

/** Hit (位置も数字も一致) / Blow (数字のみ一致) を数える。 */
export function judge(answer: number[], guess: number[]): { hit: number; blow: number } {
  let hit = 0
  let blow = 0
  guess.forEach((d, i) => {
    if (answer[i] === d) hit += 1
    else if (answer.includes(d)) blow += 1
  })
  return { hit, blow }
}

/** 少ない試行回数ほど高スコア (1回目=100点、10回目=10点)。 */
export function toScore(turns: number): number {
  return (MAX_TURNS + 1 - turns) * 10
}
