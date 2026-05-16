import { useCallback, useEffect, useReducer, useRef } from 'react'
import type { GameState, Phase } from '../types'
import { fetchArticleHTML, fetchTwoArticles } from '../lib/wikipedia'
import { processHTML } from '../lib/processHTML'
import { bfs } from '../lib/bfs'

type Action =
  | { type: 'SET_ARTICLES'; start: { title: string; description: string }; target: { title: string; description: string } }
  | { type: 'START_GAME'; html: string }
  | { type: 'NAVIGATE'; title: string; html: string; addToPath: boolean }
  | { type: 'BROWSER_BACK' }
  | { type: 'BROWSER_FORWARD'; html: string }
  | { type: 'FINISH'; won: boolean }
  | { type: 'BFS_START' }
  | { type: 'BFS_PROGRESS'; message: string }
  | { type: 'BFS_DONE'; path: string[] | null }
  | { type: 'SET_LOADING_HTML'; html: string }
  | { type: 'RESET' }

const initial: GameState = {
  phase: 'setup',
  start: null,
  target: null,
  currentTitle: '',
  currentHTML: '',
  browserHistory: [],
  browserIdx: -1,
  path: [],
  elapsed: 0,
  bfs: { status: 'idle', path: null, progress: '' },
}

const norm = (t: string) => t.toLowerCase().replace(/_/g, ' ').trim()

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_ARTICLES':
      return { ...initial, start: action.start, target: action.target }

    case 'START_GAME': {
      const title = state.start!.title
      return {
        ...state,
        phase: 'playing' as Phase,
        currentTitle: title,
        currentHTML: action.html,
        browserHistory: [title],
        browserIdx: 0,
        path: [title],
      }
    }

    case 'NAVIGATE': {
      const newHistory = state.browserHistory.slice(0, state.browserIdx + 1).concat(action.title)
      return {
        ...state,
        currentTitle: action.title,
        currentHTML: action.html,
        browserHistory: newHistory,
        browserIdx: newHistory.length - 1,
        path: action.addToPath ? [...state.path, action.title] : state.path,
      }
    }

    case 'BROWSER_BACK': {
      const idx = state.browserIdx - 1
      return { ...state, browserIdx: idx, currentTitle: state.browserHistory[idx], currentHTML: '' }
    }

    case 'BROWSER_FORWARD': {
      const idx = state.browserIdx + 1
      return { ...state, browserIdx: idx, currentTitle: state.browserHistory[idx], currentHTML: action.html }
    }

    case 'SET_LOADING_HTML':
      return { ...state, currentHTML: action.html }

    case 'FINISH':
      return { ...state, phase: 'finished' }

    case 'BFS_START':
      return { ...state, bfs: { status: 'running', path: null, progress: 'Starting search…' } }

    case 'BFS_PROGRESS':
      return { ...state, bfs: { ...state.bfs, progress: action.message } }

    case 'BFS_DONE':
      return {
        ...state,
        bfs: {
          status: action.path ? 'found' : 'not-found',
          path: action.path,
          progress: action.path ? 'Path found!' : 'No path found within search depth.',
        },
      }

    case 'RESET':
      return initial

    default:
      return state
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, initial)
  const isLoadingRef = useRef(false)
  const timerRunning = state.phase === 'playing'
  const elapsedRef = useRef(0)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  // Timer via RAF
  useEffect(() => {
    if (timerRunning) {
      startTimeRef.current = Date.now() - elapsedRef.current
      const tick = () => {
        elapsedRef.current = Date.now() - startTimeRef.current!
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } else {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [timerRunning])

  const getElapsed = useCallback(() => elapsedRef.current, [])

  const shuffle = useCallback(async () => {
    dispatch({ type: 'RESET' })
    const [start, target] = await fetchTwoArticles()
    dispatch({ type: 'SET_ARTICLES', start, target })
  }, [])

  // On mount, fetch initial articles
  useEffect(() => {
    shuffle()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startGame = useCallback(async () => {
    if (!state.start) return
    isLoadingRef.current = true
    try {
      const raw = await fetchArticleHTML(state.start.title)
      const html = processHTML(raw)
      dispatch({ type: 'START_GAME', html })
    } finally {
      isLoadingRef.current = false
    }
  }, [state.start])

  const navigateTo = useCallback(
    async (title: string, addToPath = true) => {
      if (isLoadingRef.current) return
      if (norm(title) === norm(state.currentTitle)) return

      isLoadingRef.current = true
      dispatch({ type: 'SET_LOADING_HTML', html: '' })

      try {
        const raw = await fetchArticleHTML(title)
        const html = processHTML(raw)
        dispatch({ type: 'NAVIGATE', title, html, addToPath })

        // Win check
        if (state.target && norm(title) === norm(state.target.title)) {
          dispatch({ type: 'FINISH', won: true })
          runBfs(state.start!.title, state.target.title)
        }
      } finally {
        isLoadingRef.current = false
      }
    },
    [state.currentTitle, state.target, state.start], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const browserBack = useCallback(async () => {
    if (isLoadingRef.current || state.browserIdx <= 0) return
    isLoadingRef.current = true
    const prevTitle = state.browserHistory[state.browserIdx - 1]
    dispatch({ type: 'BROWSER_BACK' })
    try {
      const raw = await fetchArticleHTML(prevTitle)
      const html = processHTML(raw)
      dispatch({ type: 'SET_LOADING_HTML', html })
    } finally {
      isLoadingRef.current = false
    }
  }, [state.browserIdx, state.browserHistory])

  const browserForward = useCallback(async () => {
    if (isLoadingRef.current || state.browserIdx >= state.browserHistory.length - 1) return
    isLoadingRef.current = true
    const nextTitle = state.browserHistory[state.browserIdx + 1]
    try {
      const raw = await fetchArticleHTML(nextTitle)
      const html = processHTML(raw)
      dispatch({ type: 'BROWSER_FORWARD', html })
    } finally {
      isLoadingRef.current = false
    }
  }, [state.browserIdx, state.browserHistory])

  const giveUp = useCallback(() => {
    if (!state.start || !state.target) return
    dispatch({ type: 'FINISH', won: false })
    runBfs(state.start.title, state.target.title)
  }, [state.start, state.target]) // eslint-disable-line react-hooks/exhaustive-deps

  const runBfs = useCallback(async (start: string, target: string) => {
    dispatch({ type: 'BFS_START' })
    const result = await bfs(start, target, (msg) => {
      dispatch({ type: 'BFS_PROGRESS', message: msg })
    })
    dispatch({ type: 'BFS_DONE', path: result })
  }, [])

  const playAgain = useCallback(async () => {
    elapsedRef.current = 0
    dispatch({ type: 'RESET' })
    const [start, target] = await fetchTwoArticles()
    dispatch({ type: 'SET_ARTICLES', start, target })
  }, [])

  return {
    state,
    isLoading: isLoadingRef,
    getElapsed,
    shuffle,
    startGame,
    navigateTo,
    browserBack,
    browserForward,
    giveUp,
    playAgain,
  }
}
