import type { ArticleInfo } from '../types'

const BASE = 'https://en.wikipedia.org'

const FALLBACK_PAIR: [ArticleInfo, ArticleInfo] = [
  { title: 'Photosynthesis', description: 'Process by which plants convert light to energy' },
  { title: 'Formula One', description: 'Highest class of international single-seater auto racing' },
]

const SKIP_DESC = [
  'species of', 'genus of', 'family of', 'order of', 'class of',
  'taxon ', 'cultivar', 'strain of',
]

const SKIP_TITLE_SUFFIX = [' (EP)', ' (song)', ' (single)']

function isGoodArticle(title: string, description: string, extract: string, ns: number): boolean {
  if (ns !== 0) return false
  if (title.toLowerCase().includes('disambiguation')) return false
  if (title.startsWith('List of')) return false
  // require a substantial extract — short articles are obscure stubs
  if (extract.length < 400) return false
  // skip hyper-specific biological taxa and micro-stubs
  const descLower = description.toLowerCase()
  if (SKIP_DESC.some((s) => descLower.includes(s))) return false
  // skip individual singles/EPs that are too obscure to navigate from
  if (SKIP_TITLE_SUFFIX.some((s) => title.endsWith(s))) return false
  return true
}

export async function randomArticle(): Promise<ArticleInfo> {
  for (let i = 0; i < 8; i++) {
    try {
      const res = await fetch(`${BASE}/api/rest_v1/page/random/summary`)
      if (!res.ok) continue
      const data = await res.json()
      if (isGoodArticle(data.title, data.description ?? '', data.extract ?? '', data.ns ?? 0)) {
        return { title: data.title, description: data.description ?? data.extract?.slice(0, 120) ?? '' }
      }
    } catch {
      // retry
    }
  }
  // fallback — pick one of the two hardcoded articles at random
  return Math.random() < 0.5 ? FALLBACK_PAIR[0] : FALLBACK_PAIR[1]
}

export async function fetchTwoArticles(): Promise<[ArticleInfo, ArticleInfo]> {
  try {
    const [a, b] = await Promise.all([randomArticle(), randomArticle()])
    // avoid duplicates
    if (a.title === b.title) {
      return [a, FALLBACK_PAIR[1]]
    }
    return [a, b]
  } catch {
    return FALLBACK_PAIR
  }
}

export async function fetchArticleHTML(title: string): Promise<string> {
  const encoded = encodeURIComponent(title)
  const res = await fetch(`${BASE}/api/rest_v1/page/html/${encoded}`)
  if (!res.ok) throw new Error(`Failed to fetch article: ${title}`)
  return res.text()
}

export async function getLinks(title: string): Promise<string[]> {
  const encoded = encodeURIComponent(title)
  const url = `${BASE}/w/api.php?action=query&prop=links&titles=${encoded}&pllimit=500&plnamespace=0&format=json&origin=*`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()
  const pages = data?.query?.pages
  if (!pages) return []
  const page = Object.values(pages)[0] as { links?: Array<{ title: string }> }
  return page?.links?.map((l) => l.title) ?? []
}

export async function getLinksHere(title: string): Promise<string[]> {
  const encoded = encodeURIComponent(title)
  const url = `${BASE}/w/api.php?action=query&prop=linkshere&titles=${encoded}&lhlimit=500&lhnamespace=0&lhprop=title&format=json&origin=*`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()
  const pages = data?.query?.pages
  if (!pages) return []
  const page = Object.values(pages)[0] as { linkshere?: Array<{ title: string }> }
  return page?.linkshere?.map((l) => l.title) ?? []
}
