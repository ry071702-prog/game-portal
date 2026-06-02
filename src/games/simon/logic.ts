export type Pad = 0 | 1 | 2 | 3

/** 末尾にランダムな1手を足したシーケンスを返す。 */
export function extend(seq: Pad[], rng: () => number = Math.random): Pad[] {
  return [...seq, Math.floor(rng() * 4) as Pad]
}

/** 入力がシーケンスの先頭から一致しているか (途中まででもOK)。 */
export function matchesPrefix(seq: Pad[], input: Pad[]): boolean {
  return input.every((v, i) => v === seq[i])
}

/** 入力がシーケンスを完全に再現したか。 */
export function isComplete(seq: Pad[], input: Pad[]): boolean {
  return input.length === seq.length && matchesPrefix(seq, input)
}
