import { afterEach, describe, expect, it, vi } from 'vitest'
import { searchArticles } from './wikipedia'

describe('searchArticles', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns title-only article suggestions from Wikipedia search results', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        query: {
          search: [
            { title: 'Tulane University' },
            { title: 'Tulane Green Wave' },
          ],
        },
      }),
    } as Response)

    const results = await searchArticles('tulane')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0][0])).toContain('list=search')
    expect(String(fetchMock.mock.calls[0][0])).toContain('srsearch=tulane')
    expect(results).toEqual([
      { title: 'Tulane University', description: '' },
      { title: 'Tulane Green Wave', description: '' },
    ])
  })

  it('does not call Wikipedia for blank queries', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')

    const results = await searchArticles('   ')

    expect(fetchMock).not.toHaveBeenCalled()
    expect(results).toEqual([])
  })
})
