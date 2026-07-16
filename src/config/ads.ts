/**
 * Google AdSense 設定 (ID 待受け型)。
 *
 * AdSense の審査が通ったら client / slot に発行された ID を貼るだけで
 * 広告ユニットが有効化される。空文字のままなら AdSlot は何も描画せず
 * (DOM も script も一切追加しない)、レイアウトへの影響はゼロ。
 */
export interface AdsConfig {
  /** AdSense クライアント ID。例: 'ca-pub-XXXXXXXXXXXXXXXX' */
  client: string
  /** 広告ユニットのスロット ID。例: '1234567890' */
  slot: string
}

export const ADS: AdsConfig = {
  client: '',
  slot: '',
}

/** client と slot が両方設定されているときのみ広告を有効化する。 */
export const adsConfigured = ADS.client !== '' && ADS.slot !== ''
