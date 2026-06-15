# game-portal — 進捗ボード
<!-- statusline / session-start / /board がこのファイルを読みます。自由に編集してOK。 -->

## 状態
進行中  <!-- 進行中 | レビュー待ち | 完了 | 停滞 のいずれか -->

## いま
**ミニゲーム16本 + Gemini 生成アイコン + 本番稼働中**。Cyber Game Arcade デザイン。
React 19 + Vite + Tailwind v4 + Cloudflare Pages (D1 リーダーボード)。
本番: https://game-portal-bfc.pages.dev

## 次にやること
- [ ] (任意) ゲーム追加 — `src/core/registry.ts` に import+配列1行 + `src/games/<id>/` の4ファイル (logic.ts / logic.test.ts / Component / manifest.ts)
- [ ] (任意) ゲーム内画像も Gemini 生成 (`gen-icons.ts` の per-game override 機構を流用)
- [ ] 本番系の Gemini キー分割は見送り — game-portal のみ専用キー、info-collector/daily-report-gen/Dify はリスク低で共有のまま (2026-06-14 判断)

## 完了 (直近 2026-06-14)
- [x] ミニゲーム6本追加 (10→16): マインスイーパー / ブロックフォール / ターゲットラッシュ / ○×ゲーム / 四目並べ / ヒット&ブロー
- [x] デプロイ前の多角レビュー(ワークフロー)で実バグ5件修正: connect4 の二重スコア送信(firedRef ガード) / 終了音の二重再生(Shell へ委譲) / 背景タブ復帰時の dt スパイク(useGameLoop クランプ) / SCORE_CAP×2 (blockfall・tictactoe)
- [x] 全16ゲームのカードアイコンを Gemini (gemini-2.5-flash-image / Nano Banana) で生成。弱い3枚 (tictactoe/connect4/slide15) は per-game プロンプト override で再生成
- [x] `gen-icons.ts` を Gemini 対応 + `.dev.vars` から鍵自動読込 (鍵をコマンド・会話に残さない運用)
- [x] 鍵漏えい対応: 全プロジェクト鍵ローテーション + 漏えい鍵 revoke 検証、game-portal は専用キーに分離
- [x] 本番デプロイ (Cloudflare Pages)
