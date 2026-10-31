import type { CorrectionMode } from '@/features/correction'

/** Ajustes do Ditado, vindos da tela Configurar música pela query string. */
export interface DictationSettings {
  pauseAtEnd: boolean
  rate: number
  correction: CorrectionMode
  /** Só estes versos (índices 0-based); ausente = a música inteira. Na URL: `versos=6,14` (1-based). */
  lines?: number[]
}

export const DEFAULT_DICTATION_SETTINGS: DictationSettings = {
  pauseAtEnd: true,
  rate: 1,
  correction: 'tolerant',
}

const RATES = [0.5, 0.75, 1]

export function parseDictationSettings(params: URLSearchParams): DictationSettings {
  const rate = Number(params.get('velocidade'))
  const lines = (params.get('versos') ?? '')
    .split(',')
    .map(Number)
    .filter((n) => Number.isInteger(n) && n >= 1)
    .map((n) => n - 1)
  return {
    pauseAtEnd: params.get('pausa') !== 'desligada',
    rate: RATES.includes(rate) ? rate : DEFAULT_DICTATION_SETTINGS.rate,
    correction: params.get('correcao') === 'estrita' ? 'strict' : 'tolerant',
    ...(lines.length ? { lines: [...new Set(lines)].sort((a, b) => a - b) } : {}),
  }
}

export function dictationQuery(settings: DictationSettings): string {
  const params = new URLSearchParams({
    pausa: settings.pauseAtEnd ? 'fim' : 'desligada',
    velocidade: String(settings.rate),
    correcao: settings.correction === 'strict' ? 'estrita' : 'tolerante',
  })
  if (settings.lines?.length) params.set('versos', settings.lines.map((i) => i + 1).join(','))
  return params.toString()
}

/**
 * Converte as opções escolhidas no Setup (os rótulos do Segmented) em ajustes.
 * Rótulo desconhecido → valor padrão.
 */
export function settingsFromLabels(labels: {
  pause?: string
  speed?: string
  correction?: string
}): DictationSettings {
  const rate = Number(labels.speed?.replace('×', '').replace(',', '.'))
  return {
    pauseAtEnd: labels.pause !== 'Desligada',
    rate: RATES.includes(rate) ? rate : DEFAULT_DICTATION_SETTINGS.rate,
    correction: labels.correction === 'Estrita' ? 'strict' : 'tolerant',
  }
}

/**
 * Onde começar a tocar o verso `index` com um pequeno recuo (`preRollMs`), sem voltar além
 * do fim do verso anterior: senão a pausa no fim do verso anterior dispararia na hora.
 */
export function seekPointFor(
  lines: readonly { startMs: number; endMs: number }[],
  index: number,
  preRollMs: number,
): number {
  const line = lines[index]
  if (!line) return 0
  const floor = lines[index - 1]?.endMs ?? 0
  return Math.max(line.startMs - preRollMs, floor, 0)
}
