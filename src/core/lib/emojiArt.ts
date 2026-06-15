// 絵文字 → 生成スプライト画像の slug。public/sprites/<slug>.png を指す。
// アバター/ゲーム内スプライトは内部的に絵文字を ID として保持し、表示だけ画像に差し替える。
// (保存値・サーバ検証リストは絵文字のまま = 変更不要)
const SLUG: Record<string, string> = {
  // whack
  '🐹': 'mole',
  // memory fruits
  '🍎': 'apple', '🍌': 'banana', '🍇': 'grapes', '🍑': 'peach',
  '🍓': 'strawberry', '🍒': 'cherries', '🥝': 'kiwi', '🍍': 'pineapple',
  // mines
  '💣': 'bomb', '🚩': 'flag',
  // avatars
  '🎮': 'av-gamepad', '👾': 'av-invader', '🤖': 'av-robot', '👽': 'av-alien',
  '🐱': 'av-cat', '🐶': 'av-dog', '🦊': 'av-fox', '🐼': 'av-panda', '🐸': 'av-frog',
  '🦄': 'av-unicorn', '🐲': 'av-dragon', '🦖': 'av-trex', '⭐': 'av-star', '🔥': 'av-fire',
  '🌈': 'av-rainbow', '💀': 'av-skull', '🎧': 'av-headphones', '🍩': 'av-donut',
}

/** 絵文字に対応するスプライト画像 URL。未対応なら null (= 絵文字のまま表示)。 */
export function artSrc(emoji: string): string | null {
  const slug = SLUG[emoji]
  return slug ? `/sprites/${slug}.png` : null
}
