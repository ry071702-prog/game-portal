import { useEffect } from 'react'

interface SeoProps {
  title: string
  description?: string
}

function setMeta(selector: string, attr: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    const [, key, name] = selector.match(/\[(.+?)="(.+?)"\]/) ?? []
    if (key && name) el.setAttribute(key, name)
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

/** document.title と OGP メタを動的更新する (静的 SPA なので CSR で書き換え)。 */
export function Seo({ title, description }: SeoProps) {
  useEffect(() => {
    document.title = title
    setMeta('meta[property="og:title"]', 'content', title)
    if (description) {
      setMeta('meta[name="description"]', 'content', description)
      setMeta('meta[property="og:description"]', 'content', description)
    }
  }, [title, description])
  return null
}
