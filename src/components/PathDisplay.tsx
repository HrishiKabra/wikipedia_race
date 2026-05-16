interface PathDisplayProps {
  path: string[]
  targetTitle?: string
  won?: boolean
  compact?: boolean
}

export function PathDisplay({ path, targetTitle, won, compact }: PathDisplayProps) {
  const items = [...path]
  if (!won && targetTitle && items[items.length - 1] !== targetTitle) {
    // show target as failed endpoint
    items.push(targetTitle)
  }

  return (
    <div className={`flex items-center flex-wrap gap-1 ${compact ? 'text-xs' : 'text-sm'}`}>
      {items.map((title, i) => {
        const isLast = i === items.length - 1
        const isFailed = !won && isLast && targetTitle && title === targetTitle
        const isWon = won && isLast
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-400">›</span>}
            <span
              className={`${
                isWon
                  ? 'text-emerald-600 font-semibold'
                  : isFailed
                  ? 'text-red-500 font-semibold'
                  : i === 0
                  ? 'text-gray-700 font-medium'
                  : 'text-gray-600'
              }`}
            >
              {title}
              {isWon && ' ✓'}
              {isFailed && ' ✗'}
            </span>
          </span>
        )
      })}
    </div>
  )
}
