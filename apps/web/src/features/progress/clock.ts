/** Intervalo parado acima disto não conta como prática (o usuário saiu da tela, foi tomar café…). */
export const IDLE_CAP_MS = 2 * 60 * 1000

/**
 * Relógio de prática ativa: soma o tempo entre interações, limitando cada intervalo a
 * `idleCapMs`. A primeira marcação só inicia a contagem.
 */
export function createPracticeClock(now: () => number = Date.now, idleCapMs = IDLE_CAP_MS) {
  let last: number | null = null
  let total = 0
  return {
    mark() {
      const current = now()
      if (last !== null) total += Math.min(Math.max(0, current - last), idleCapMs)
      last = current
    },
    elapsedMs: () => total,
    started: () => last !== null,
  }
}

export type PracticeClock = ReturnType<typeof createPracticeClock>
