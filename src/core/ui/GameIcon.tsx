import { useState } from 'react'

interface GameIconProps {
  /** id でアイコン画像 (/icons/<id>.png) を引く。thumbnail はフォールバック用。 */
  game: { id: string; thumbnail: string }
  /** <img> に当てるクラス (サイズ・object-fit・角丸など) */
  className?: string
  /** 画像読み込み失敗時のフォールバック絵文字 <span> に当てるクラス (文字サイズ等) */
  fallbackClassName?: string
}

/**
 * ゲームのカードアイコン画像 (/icons/<id>.png) を表示。
 * 読み込み失敗時は manifest の絵文字サムネにフォールバックする。
 */
export function GameIcon({ game, className, fallbackClassName }: GameIconProps) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <span className={fallbackClassName} aria-hidden>
        {game.thumbnail}
      </span>
    )
  }
  return (
    <img
      src={`/icons/${game.id}.png`}
      alt=""
      loading="lazy"
      draggable={false}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
