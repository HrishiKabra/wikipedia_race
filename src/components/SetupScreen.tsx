import { useEffect, useRef, useState } from 'react'
import { fetchArticleSummary, searchArticles } from '../lib/wikipedia'
import type { ArticleInfo } from '../types'

interface SetupScreenProps {
  start: ArticleInfo | null
  target: ArticleInfo | null
  onStart: () => void
  onShuffle: () => void
  onSetStart: (article: ArticleInfo) => void
  onSetTarget: (article: ArticleInfo) => void
}

function ArticleCard({
  role,
  article,
  accent,
}: {
  role: string
  article: ArticleInfo | null
  accent?: boolean
}) {
  return (
    <div
      className={`flex-1 rounded-xl border-2 p-6 flex flex-col gap-2 ${
        accent ? 'border-[#1D9E75] bg-[#f0fdf8]' : 'border-gray-200 bg-white'
      }`}
    >
      <span
        className={`text-xs font-bold tracking-widest uppercase ${
          accent ? 'text-[#1D9E75]' : 'text-gray-400'
        }`}
      >
        {role}
      </span>
      {article ? (
        <>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">{article.title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{article.description}</p>
        </>
      ) : (
        <div className="animate-pulse space-y-2 mt-1">
          <div className="h-6 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-4/5" />
        </div>
      )}
    </div>
  )
}

function ArticlePicker({
  label,
  selected,
  onSelect,
}: {
  label: string
  selected: ArticleInfo | null
  onSelect: (article: ArticleInfo) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ArticleInfo[]>([])
  const [status, setStatus] = useState('')
  const [open, setOpen] = useState(false)
  const inputId = `${label.toLowerCase()}-article-search`
  const latestRequest = useRef(0)

  useEffect(() => {
    setQuery(selected?.title ?? '')
  }, [selected?.title])

  useEffect(() => {
    const requestId = latestRequest.current + 1
    latestRequest.current = requestId

    if (!open) {
      setResults([])
      setStatus('')
      return
    }

    if (query.trim().length < 2) {
      setResults([])
      setStatus(query.trim() ? 'Keep typing...' : '')
      return
    }

    setStatus('Searching...')
    const timeout = window.setTimeout(async () => {
      const matches = await searchArticles(query)
      if (latestRequest.current !== requestId) return
      setResults(matches)
      setStatus(matches.length ? '' : 'No matches')
    }, 220)

    return () => window.clearTimeout(timeout)
  }, [open, query])

  async function chooseArticle(article: ArticleInfo) {
    setQuery(article.title)
    setOpen(false)
    setResults([])
    setStatus('Loading preview...')
    const summary = await fetchArticleSummary(article.title)
    onSelect(summary)
    setStatus('')
  }

  return (
    <div className="relative">
      <label
        htmlFor={inputId}
        className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2"
      >
        {label}
      </label>
      <input
        id={inputId}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={selected ? selected.title : `Search ${label.toLowerCase()} article`}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
      />

      {open && (query.trim().length > 0 || results.length > 0) ? (
        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="max-h-64 overflow-y-auto py-1">
            {results.map((article) => (
              <button
                key={article.title}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => chooseArticle(article)}
                className="block w-full px-4 py-3 text-left text-sm font-semibold text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                {article.title}
              </button>
            ))}
            {status ? (
              <div className="px-4 py-3 text-sm font-semibold text-gray-400">{status}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function SetupScreen({
  start,
  target,
  onStart,
  onShuffle,
  onSetStart,
  onSetTarget,
}: SetupScreenProps) {
  const ready = start !== null && target !== null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">Wikipedia Race</h1>
          <p className="text-gray-500 text-lg">
            Navigate from one article to another using only internal links.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ArticlePicker label="Start" selected={start} onSelect={onSetStart} />
          <ArticlePicker label="Target" selected={target} onSelect={onSetTarget} />
        </div>

        {/* Article cards */}
        <div className="flex flex-col gap-4 items-stretch sm:flex-row">
          <ArticleCard role="Start" article={start} />
          <div className="flex items-center self-center text-3xl text-gray-300 font-light select-none">→</div>
          <ArticleCard role="Target" article={target} accent />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onStart}
            disabled={!ready}
            className="px-8 py-3 rounded-lg bg-gray-900 text-white font-semibold text-sm hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Start Race
          </button>
          <button
            onClick={onShuffle}
            className="px-8 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-colors"
          >
            Shuffle
          </button>
        </div>

        {/* BFS note */}
        <p className="text-center text-xs text-gray-400">
          After the game, BFS will find and display a shortest path between the two articles.
        </p>
      </div>
    </div>
  )
}
