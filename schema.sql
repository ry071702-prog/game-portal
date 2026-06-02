CREATE TABLE IF NOT EXISTS scores (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id    TEXT    NOT NULL,
  name       TEXT    NOT NULL,
  avatar     TEXT    NOT NULL DEFAULT '🎮',  -- ユーザーアイコン (絵文字)
  score      INTEGER NOT NULL,
  client_id  TEXT    NOT NULL,   -- 端末ごとの匿名UUID
  created_at INTEGER NOT NULL,   -- unix ms
  day        TEXT    NOT NULL,   -- Asia/Tokyo の YYYY-MM-DD
  mode       TEXT    NOT NULL DEFAULT 'free'  -- 'free' | 'daily' (デイリーチャレンジ)
);
CREATE INDEX IF NOT EXISTS idx_alltime ON scores(game_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_daily   ON scores(game_id, day, score DESC);
CREATE INDEX IF NOT EXISTS idx_rate    ON scores(client_id, created_at);
