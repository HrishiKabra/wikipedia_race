import { getLinks, getLinksHere } from './wikipedia'

const norm = (t: string) => t.toLowerCase().replace(/_/g, ' ').trim()
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function bfs(
  start: string,
  target: string,
  onProgress: (msg: string) => void,
): Promise<string[] | null> {
  const targetNorm = norm(target)
  const startNorm = norm(start)

  if (startNorm === targetNorm) return [start]

  // Phase 1 — parallel fetch of forward depth-1 (links FROM start)
  //           and backward depth-1 (articles that link TO target)
  onProgress('Fetching link data…')
  const [fwdD1, bwdD1Raw] = await Promise.all([getLinks(start), getLinksHere(target)])
  await delay(25)

  // 1-hop: start directly links to target
  for (const link of fwdD1) {
    if (norm(link) === targetNorm) return [start, target]
  }

  // Build backward lookup: normalisedTitle → canonical title
  const bwdSet = new Map<string, string>()
  for (const t of bwdD1Raw) bwdSet.set(norm(t), t)

  const fwdD1Set = new Set(fwdD1.map(norm))

  // 2-hop: start → X → target  (X in fwdD1 ∩ bwdD1)
  for (const [n, canonical] of bwdSet) {
    if (fwdD1Set.has(n)) return [start, canonical, target]
  }

  // Phase 2 — expand each fwdD1 article, collect fwdD2, check:
  //   • direct: fwdD2 contains target → 2-hop
  //   • bidir 3-hop: fwdD2 ∩ bwdD1
  const visited = new Set<string>([startNorm, ...fwdD1.map(norm)])
  // fwdD2: each entry carries the depth-1 parent so we can reconstruct paths
  const fwdD2: Array<{ title: string; via: string }> = []
  const fwdD1Sample = fwdD1.slice(0, 150)

  onProgress(`Checking ${fwdD1Sample.length} intermediate articles…`)

  for (let i = 0; i < fwdD1Sample.length; i++) {
    const x = fwdD1Sample[i]
    const xLinks = await getLinks(x)
    await delay(20)

    for (const y of xLinks) {
      const n = norm(y)
      if (n === targetNorm) return [start, x, target]           // 2-hop direct
      if (bwdSet.has(n)) return [start, x, bwdSet.get(n)!, target]  // 3-hop bidir
      if (!visited.has(n)) {
        visited.add(n)
        fwdD2.push({ title: y, via: x })
      }
    }

    if ((i + 1) % 25 === 0) {
      onProgress(`Checked ${i + 1} / ${fwdD1Sample.length} articles…`)
    }
  }

  // Phase 3 — expand fwdD2 (forward depth-3 check).
  // Always run this; it's the only option when bwdD1 is tiny/empty.
  const fwdD2Sample = fwdD2.slice(0, 60)
  if (fwdD2Sample.length > 0) {
    onProgress(`Searching deeper (${fwdD2Sample.length} articles)…`)
    for (const { title, via } of fwdD2Sample) {
      const links = await getLinks(title)
      await delay(20)
      for (const link of links) {
        const n = norm(link)
        if (n === targetNorm) return [start, via, title, target]              // 3-hop forward
        if (bwdSet.has(n)) return [start, via, title, bwdSet.get(n)!, target] // 4-hop bidir
      }
    }
  }

  // Phase 4 — expand backward: get articles that link TO each bwdD1 article (bwdD2).
  // If any bwdD2 article is in fwdD1, we have a 3-hop path from the other direction.
  const bwdD1Sample = bwdD1Raw.slice(0, 40)
  if (bwdD1Sample.length > 0) {
    onProgress('Expanding backward from target…')
    for (const bwdArticle of bwdD1Sample) {
      const bwdLinks = await getLinksHere(bwdArticle)
      await delay(20)
      for (const blink of bwdLinks) {
        const n = norm(blink)
        if (fwdD1Set.has(n)) return [start, blink, bwdArticle, target]  // 3-hop bidir reverse
      }
    }
  }

  onProgress('No path found within search depth.')
  return null
}
