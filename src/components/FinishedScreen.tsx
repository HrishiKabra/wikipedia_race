import type { GameState } from '../types'
import { PathDisplay } from './PathDisplay'

interface FinishedScreenProps {
  state: GameState
  finalElapsed: number
  onPlayAgain: () => void
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return m > 0 ? `${m}:${(s % 60).toString().padStart(2, '0')}` : `${s}s`
}

export function FinishedScreen({ state, finalElapsed, onPlayAgain }: FinishedScreenProps) {
  const { path, start, target, bfs } = state
  const won = state.won === true
  const hops = path.length - 1
  const bfsHops = bfs.path ? bfs.path.length - 1 : null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        {/* Result header */}
        <div className="text-center space-y-2">
          <div className={`text-6xl font-black ${won ? 'text-[#1D9E75]' : 'text-gray-400'}`}>
            {won ? 'You made it!' : 'Better luck next time'}
          </div>
          <p className="text-gray-500">
            {won
              ? `Reached "${target?.title}" in ${hops} hop${hops !== 1 ? 's' : ''} — ${formatTime(finalElapsed)}`
              : `You gave up after ${hops} hop${hops !== 1 ? 's' : ''} — ${formatTime(finalElapsed)}`}
          </p>
        </div>

        {/* Your path */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Your path</h3>
          <PathDisplay path={path} targetTitle={target?.title} won={!!won} />
          <p className="text-xs text-gray-400 mt-1">
            {hops} hop{hops !== 1 ? 's' : ''} · {formatTime(finalElapsed)}
          </p>
        </div>

        {/* BFS result */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Shortest path we found
          </h3>

          {bfs.status === 'running' && (
            <div className="flex items-center gap-3 py-2">
              <div className="w-4 h-4 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin shrink-0" />
              <span className="text-sm text-gray-600">{bfs.progress}</span>
            </div>
          )}

          {bfs.status === 'found' && bfs.path && (
            <>
              <PathDisplay path={bfs.path} won />
              <p className="text-xs text-gray-400">
                {bfsHops} hop{bfsHops !== 1 ? 's' : ''}
                {won && bfsHops !== null
                  ? ` · you took ${hops - bfsHops >= 0 ? '+' : ''}${hops - bfsHops} hop${Math.abs(hops - bfsHops) !== 1 ? 's' : ''} vs. shortest`
                  : ''}
              </p>
            </>
          )}

          {bfs.status === 'not-found' && (
            <p className="text-sm text-gray-500 italic">
              No path found within our search depth (up to ~3 hops).
            </p>
          )}

          {bfs.status === 'idle' && (
            <p className="text-sm text-gray-400">Search not started.</p>
          )}
        </div>

        {/* Article pair reminder */}
        <div className="flex gap-4 text-sm text-center justify-center">
          <span className="text-gray-600">
            <span className="font-medium">{start?.title}</span>
          </span>
          <span className="text-gray-400">→</span>
          <span className="text-[#1D9E75] font-medium">{target?.title}</span>
        </div>

        {/* Play again */}
        <div className="text-center">
          <button
            onClick={onPlayAgain}
            className="px-10 py-3 rounded-lg bg-gray-900 text-white font-semibold text-sm hover:bg-gray-700 transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  )
}
