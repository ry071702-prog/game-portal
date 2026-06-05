#!/usr/bin/env bash
#
# Downloads(など)に置いたゲームアイコン画像を public/icons/<id>.png に取り込む。
#
# 使い方:
#   npm run icons:import                 # ~/Downloads から取り込み
#   npm run icons:import -- ~/somewhere  # 取り込み元を変える
#
# ルール:
#   取り込み元に「<ゲームID>.png / .jpg / .jpeg / .webp」という名前で画像を置くと、
#   macOS 標準の sips で正方寄り(最大512px)の PNG に変換して public/icons/<id>.png に保存する。
#   ゲームID は src/games/<id>/ のフォルダ名(= manifest の id)。ゲームを足せば自動で対象が増える。
#
# 追加ライブラリ不要(sips は macOS 同梱)。

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="${1:-$HOME/Downloads}"
DEST_DIR="$REPO_ROOT/public/icons"
MAX_PX="${ICON_MAX_PX:-512}"
EXTS=(png PNG jpg JPG jpeg JPEG webp WEBP)

mkdir -p "$DEST_DIR"

echo "取り込み元: $SRC_DIR"
echo "出力先:     $DEST_DIR (最大 ${MAX_PX}px / PNG)"
echo

imported=0
missing=()

for dir in "$REPO_ROOT"/src/games/*/; do
  id="$(basename "$dir")"

  # 取り込み元から <id>.<ext> を探す(最初に見つかったものを使う)
  src=""
  for ext in "${EXTS[@]}"; do
    cand="$SRC_DIR/$id.$ext"
    if [ -f "$cand" ]; then src="$cand"; break; fi
  done

  if [ -z "$src" ]; then
    missing+=("$id")
    continue
  fi

  out="$DEST_DIR/$id.png"
  # PNG に変換 + アスペクト比を保って最大辺を MAX_PX に縮小(透過は維持)
  sips -s format png --resampleHeightWidthMax "$MAX_PX" "$src" --out "$out" >/dev/null
  echo "✓ $id  ←  $(basename "$src")"
  imported=$((imported + 1))
done

echo
echo "取り込み: $imported 件"
if [ "${#missing[@]}" -gt 0 ]; then
  echo "未配置 (取り込み元に <id>.png 等を置けば反映): ${missing[*]}"
fi
echo
echo "→ 反映するには:  npm run deploy"
