const REMOVE_SECTION_HEADINGS = [
  'references',
  'external links',
  'see also',
  'further reading',
  'notes',
  'bibliography',
  'citations',
  'footnotes',
]

const REMOVE_SELECTORS = [
  'sup.reference',
  '.mw-editsection',
  '.navbox',
  '.navbox-styles',
  '.mbox-small',
  '.ambox',
  '.hatnote',
  '.refbegin',
  '.reflist',
  '.sidebar',
]

function headingText(section: Element): string {
  const h = section.querySelector('h2, h3')
  return h?.textContent?.trim().toLowerCase() ?? ''
}

export function processHTML(raw: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(raw, 'text/html')

  // Remove unwanted sections
  doc.querySelectorAll('section').forEach((section) => {
    const text = headingText(section)
    if (REMOVE_SECTION_HEADINGS.some((heading) => text.startsWith(heading))) {
      section.remove()
    }
  })

  // Remove unwanted elements
  REMOVE_SELECTORS.forEach((sel) => {
    doc.querySelectorAll(sel).forEach((el) => el.remove())
  })

  // Process links
  doc.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href') ?? ''
    const rel = a.getAttribute('rel') ?? ''

    const isRedLink = href.includes('redlink=1')
    const isWikiLink =
      href.startsWith('./') &&
      !href.includes(':') &&
      !href.startsWith('./#') &&
      !isRedLink &&
      rel.includes('mw:WikiLink')

    if (isWikiLink) {
      const rawTitle = decodeURIComponent(href.slice(2)).split('#')[0].split('?')[0].replace(/_/g, ' ')
      a.removeAttribute('href')
      a.setAttribute('data-wiki-title', rawTitle)
      a.classList.add('wiki-link')
    } else {
      a.removeAttribute('href')
      a.style.cursor = 'default'
      a.style.textDecoration = 'none'
      a.style.color = 'inherit'
    }
  })

  return doc.body.innerHTML
}
