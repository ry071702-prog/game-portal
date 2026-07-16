import { useEffect, useRef } from 'react'
import { ADS, adsConfigured } from '../../config/ads'
import { cn } from '../lib/cn'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

let scriptRequested = false

/** adsbygoogle の script を1回だけ遅延注入する。 */
function loadAdsScript(client: string) {
  if (scriptRequested) return
  scriptRequested = true
  const script = document.createElement('script')
  script.async = true
  script.crossOrigin = 'anonymous'
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`
  document.head.appendChild(script)
}

interface AdSlotProps {
  className?: string
}

/**
 * レスポンシブ広告ユニット (AdSense ID 待受け型)。
 *
 * - `src/config/ads.ts` が未設定なら null を返し DOM を一切残さない (CLS ゼロ)。
 * - 設定済みなら script をアイドル時 (requestIdleCallback) まで遅延注入し、
 *   初期描画・ゲーム操作をブロックしない。
 */
export function AdSlot({ className }: AdSlotProps) {
  const pushedRef = useRef(false)

  useEffect(() => {
    if (!adsConfigured || pushedRef.current) return
    pushedRef.current = true

    const activate = () => {
      loadAdsScript(ADS.client)
      try {
        ;(window.adsbygoogle = window.adsbygoogle ?? []).push({})
      } catch {
        // 広告ブロッカー等で失敗してもアプリには影響させない
      }
    }

    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(activate, { timeout: 4000 })
    } else {
      window.setTimeout(activate, 2000)
    }
  }, [])

  if (!adsConfigured) return null

  return (
    <div className={className}>
      <div className="rounded-2xl border border-line bg-white/[0.03] px-3 pb-3 pt-2">
        <p className="mb-1 text-[10px] font-bold tracking-[0.2em] text-faint">広告</p>
        <ins
          className={cn('adsbygoogle block min-h-[90px] w-full')}
          data-ad-client={ADS.client}
          data-ad-slot={ADS.slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  )
}
