import type { ArticleInfo } from '../types'

interface SetupScreenProps {
  start: ArticleInfo | null
  target: ArticleInfo | null
  onStart: () => void
  onShuffle: () => void
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

export function SetupScreen({ start, target, onStart, onShuffle }: SetupScreenProps) {
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

        {/* Article cards */}
        <div className="flex gap-4 items-stretch">
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
