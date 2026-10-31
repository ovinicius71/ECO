/** Erro no formato da API: {"error": {"code", "message"}}. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  /** Segundos sugeridos pelo servidor (ex.: LRCLIB ocupado). */
  readonly retryAfter: number | undefined

  constructor(status: number, code: string, message: string, retryAfter?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.retryAfter = retryAfter
  }
}

type Params = Record<string, string | number | undefined>

/** GET em `apps/api` (o Vite faz proxy de /api em dev). */
export async function apiGet<T>(
  path: string,
  params: Params = {},
  signal?: AbortSignal,
): Promise<T> {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query.set(key, String(value))
  }
  const url = query.size ? `/api${path}?${query}` : `/api${path}`

  let response: Response
  try {
    response = await fetch(url, { signal })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new ApiError(0, 'NETWORK', 'Não foi possível falar com o servidor do Eco.')
  }

  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const error = (body as { error?: { code?: string; message?: string } } | null)?.error
    const retryAfter = Number(response.headers.get('retry-after')) || undefined
    throw new ApiError(
      response.status,
      error?.code ?? 'UNKNOWN',
      error?.message ?? 'Erro inesperado no servidor.',
      retryAfter,
    )
  }
  return body as T
}
