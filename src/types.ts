export type Phase = 'setup' | 'playing' | 'finished'

export interface ArticleInfo {
  title: string
  description: string
}

export interface BfsState {
  status: 'idle' | 'running' | 'found' | 'not-found'
  path: string[] | null
  progress: string
}

export interface GameState {
  phase: Phase
  start: ArticleInfo | null
  target: ArticleInfo | null
  currentTitle: string
  currentHTML: string
  browserHistory: string[]
  browserIdx: number
  path: string[]
  elapsed: number
  bfs: BfsState
}
