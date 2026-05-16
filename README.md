# Wikipedia Race

A browser-based game where you race to navigate from one Wikipedia article to another using only internal links. After the game, BFS finds and displays a shortest path between the two articles.

**Live demo → [wikipediarace.netlify.app](https://wikipediarace.netlify.app/)**

---

## How to play

1. You're given a **start** article and a **target** article (fetched randomly from Wikipedia)
2. Click any blue link inside the article to navigate to that page
3. Keep hopping until you reach the target — or give up
4. After the game, a shortest path is revealed automatically

Back/forward navigation works like a browser but doesn't count as hops. Only forward clicks through new articles add to your hop count.

---

## How it works

- **Mini Wikipedia browser** — fetches live Parsoid HTML from Wikipedia's REST API, strips references/navboxes/edit buttons, and intercepts internal links via event delegation
- **Bidirectional BFS** — after the game, expands forward from start and backward from target (via `linkshere`), intersecting the two frontiers to find shortest paths in 2–4 hops without exhaustive search
- **No backend** — all Wikipedia APIs are CORS-open; the app is entirely client-side

---

## Tech stack

- Vite + React + TypeScript
- Tailwind CSS
- Wikipedia REST API (article HTML) + MediaWiki API (links / linkshere)

---

## Run locally

```bash
npm install
npm run dev
```
