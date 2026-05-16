import { useEffect, useRef, useState } from 'react'
import type { GameState } from '../types'
import { PathDisplay } from './PathDisplay'

const WIKI_STYLES = `
.wiki-content { font-size: 14px; line-height: 1.65; color: #202122; }
.wiki-content h1 { font-size: 20px; font-weight: 600; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px; }
.wiki-content h2 { font-size: 16px; font-weight: 600; border-bottom: 0.5px solid #eee; margin: 18px 0 8px; padding-bottom: 4px; }
.wiki-content h3 { font-size: 14px; font-weight: 600; margin: 14px 0 6px; }
.wiki-content p { margin-bottom: 10px; }
.wiki-content a.wiki-link { color: #3366cc; cursor: pointer; text-decoration: underline; }
.wiki-content a.wiki-link:hover { color: #0645ad; }
.wiki-content .infobox { float: right; clear: right; margin: 0 0 12px 16px; border: 1px solid #aaa; background: #f8f9fa; font-size: 11px; max-width: 220px; }
.wiki-content .infobox td, .wiki-content .infobox th { padding: 3px 6px; border: 0.5px solid #ddd; vertical-align: top; }
.wiki-content .infobox th { background: #eaecf0; text-align: center; font-weight: 500; }
.wiki-content .wikitable { border-collapse: collapse; font-size: 12px; margin: 8px 0; max-width: 100%; overflow-x: auto; display: block; }
.wiki-content .wikitable td, .wiki-content .wikitable th { border: 1px solid #aaa; padding: 3px 8px; }
.wiki-content .wikitable th { background: #eaecf0; font-weight: 500; }
.wiki-content ul, .wiki-content ol { margin: 0 0 10px 22px; }
.wiki-content li { margin-bottom: 3px; }
.wiki-content img { max-width: 100%; height: auto; }
.wiki-content .thumb { float: right; clear: right; margin: 0 0 10px 12px; max-width: 200px; font-size: 11px; color: #666; }
`

interface GameScreenProps {
  state: GameState
  getElapsed: () => number
  isLoading: React.MutableRefObject<boolean>
  onNavigate: (title: string) => void
  onBack: () => void
  onForward: () => void
  onGiveUp: () => void
}

function LoadingDot() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
      <span className="text-xs text-gray-400">Loading…</span>
    </span>
  )
}

export function GameScreen({ state, getElapsed, isLoading, onNavigate, onBack, onForward, onGiveUp }: GameScreenProps) {
  const { currentTitle, currentHTML, browserHistory, browserIdx, path, target } = state
  const contentRef = useRef<HTMLDivElement>(null)
  const [, forceRender] = useState(0)
  const [loading, setLoading] = useState(false)

  // Poll loading state for UI updates
  useEffect(() => {
    const id = setInterval(() => {
      setLoading(isLoading.current)
    }, 100)
    return () => clearInterval(id)
  }, [isLoading])

  // Scroll to top when article changes
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0
  }, [currentTitle])

  // Live elapsed display
  useEffect(() => {
    const id = setInterval(() => forceRender((n) => n + 1), 500)
    return () => clearInterval(id)
  }, [])

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (loading) return
    const link = (e.target as Element).closest('a.wiki-link')
    if (!link) return
    e.preventDefault()
    const title = link.getAttribute('data-wiki-title')
    if (title) onNavigate(title)
  }

  const elapsed = getElapsed()
  const s = Math.floor(elapsed / 1000)
  const m = Math.floor(s / 60)
  const timeStr = m > 0 ? `${m}:${(s % 60).toString().padStart(2, '0')}` : `${s}s`
  const hops = path.length - 1

  const canBack = browserIdx > 0 && !loading
  const canForward = browserIdx < browserHistory.length - 1 && !loading

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* Game bar */}
      <div className="bg-gray-900 text-white px-4 py-2 flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-gray-400">TIME</span>
          <span className="text-white font-bold">{timeStr}</span>
        </div>
        <div className="w-px h-4 bg-gray-700" />
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-gray-400">HOPS</span>
          <span className="text-white font-bold">{hops}</span>
        </div>
        <div className="w-px h-4 bg-gray-700" />
        <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar">
          <PathDisplay path={path} compact />
        </div>
        <div className="w-px h-4 bg-gray-700 shrink-0" />
        <div className="flex items-center gap-2 shrink-0 text-xs">
          <span className="text-gray-400">TARGET:</span>
          <span className="text-[#1D9E75] font-semibold">{target?.title}</span>
        </div>
        <button
          onClick={onGiveUp}
          className="shrink-0 px-3 py-1 rounded text-xs border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          Give Up
        </button>
      </div>

      {/* Browser chrome */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          disabled={!canBack}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition-colors font-bold"
          title="Back"
        >
          ←
        </button>
        <button
          onClick={onForward}
          disabled={!canForward}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition-colors font-bold"
          title="Forward"
        >
          →
        </button>
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded px-3 py-1">
          <span className="text-sm text-gray-700 font-medium truncate flex-1">{currentTitle}</span>
        </div>
        {loading && <LoadingDot />}
      </div>

      {/* Article content */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto px-6 py-4"
        onClick={handleContentClick}
      >
        <style>{WIKI_STYLES}</style>
        {loading && !currentHTML ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
            Loading article…
          </div>
        ) : (
          <div
            className="wiki-content max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: currentHTML }}
          />
        )}
      </div>
    </div>
  )
}
