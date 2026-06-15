import { useState } from 'react'
import { artSrc } from '../lib/emojiArt'

interface EmojiArtProps {
  /** 表示したい絵文字 (内部 ID)。対応するスプライト画像があれば画像で表示。 */
  emoji: string
  /** <img> に当てるクラス (サイズ・object-fit・角丸など) */
  className?: string
  /** 画像が無い/読み込み失敗時のフォールバック <span> に当てるクラス (文字サイズ等) */
  fallbackClassName?: string
  alt?: string
}

/**
 * 絵文字を対応する生成スプライト画像で表示する。
 * 未対応の絵文字、または画像読み込み失敗時は絵文字そのものにフォールバックする。
 */
export function EmojiArt({ emoji, className, fallbackClassName, alt }: EmojiArtProps) {
  const src = artSrc(emoji)
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <span className={fallbackClassName} aria-hidden={alt ? undefined : true}>
        {emoji}
      </span>
    )
  }
  return (
    <img
      src={src}
      alt={alt ?? ''}
      loading="lazy"
      draggable={false}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
