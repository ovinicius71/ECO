import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiGet } from './client'

function mockFetch(response: Response | Error) {
  const fetchMock = vi.fn(() =>
    response instanceof Error ? Promise.reject(response) : Promise.resolve(response),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('apiGet', () => {
  it('monta a URL com /api e ignora parâmetros vazios', async () => {
    const fetchMock = mockFetch(Response.json({ ok: true }))

    await expect(
      apiGet('/lyrics', { track: 'Paper Moon', artist: '', duration: 221 }),
    ).resolves.toEqual({
      ok: true,
    })
    expect(fetchMock).toHaveBeenCalledWith('/api/lyrics?track=Paper+Moon&duration=221', {
      signal: undefined,
    })
  })

  it('transforma o formato de erro da API em ApiError', async () => {
    mockFetch(
      Response.json(
        { error: { code: 'UPSTREAM_BUSY', message: 'Ocupado' } },
        { status: 503, headers: { 'Retry-After': '7' } },
      ),
    )

    const error = await apiGet('/lyrics').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 503,
      code: 'UPSTREAM_BUSY',
      message: 'Ocupado',
      retryAfter: 7,
    })
  })

  it('erro de rede vira NETWORK', async () => {
    mockFetch(new TypeError('Failed to fetch'))
    await expect(apiGet('/health')).rejects.toMatchObject({ code: 'NETWORK', status: 0 })
  })

  it('resposta de erro sem JSON vira UNKNOWN', async () => {
    mockFetch(new Response('Bad gateway', { status: 502 }))
    await expect(apiGet('/health')).rejects.toMatchObject({ code: 'UNKNOWN', status: 502 })
  })
})
