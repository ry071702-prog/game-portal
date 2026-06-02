/** 現在時刻(ms)。コンポーネント内で直接 performance.now を呼ぶと
 *  purity lint に触れるため、関数経由で利用する。 */
export function now(): number {
  return performance.now()
}
