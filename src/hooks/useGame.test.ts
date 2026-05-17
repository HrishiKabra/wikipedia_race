import { describe, expect, it } from 'vitest'
import { initialGameState, reducer } from './useGame'

describe('useGame reducer', () => {
  it('preserves an explicit win result when finishing through a redirect alias', () => {
    const state = {
      ...initialGameState,
      phase: 'playing' as const,
      start: { title: 'Fortnite', description: '' },
      target: { title: 'Ninja (gamer)', description: '' },
      currentTitle: 'Ninja (streamer)',
      path: ['Fortnite', 'Ninja (streamer)'],
    }

    const next = reducer(state, { type: 'FINISH', won: true })

    expect(next.phase).toBe('finished')
    expect(next.won).toBe(true)
    expect(next.path).toEqual(['Fortnite', 'Ninja (streamer)'])
  })
})
