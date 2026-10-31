export type AlignOp =
  | { kind: 'pair'; expected: number; typed: number; cost: number }
  | { kind: 'missing'; expected: number }
  | { kind: 'extra'; typed: number }

// Custos internos em inteiros (×1000) para comparar sem erro de ponto flutuante.
const SCALE = 1000
const GAP = SCALE
/** Desempate: um par não exato custa um pouquinho a mais, então vence o caminho com mais acertos. */
const TIE_BREAK = 1

/**
 * Alinhamento global de Needleman–Wunsch com custo mínimo (lacuna = 1).
 * `substitution(i, j)` dá o custo de parear o esperado i com o digitado j (0 = igual).
 * Empates de custo são decididos a favor de mais pares exatos; depois, par → faltando → extra.
 */
export function align(
  expectedCount: number,
  typedCount: number,
  substitution: (expected: number, typed: number) => number,
): AlignOp[] {
  const pairCost = (i: number, j: number) => {
    const cost = substitution(i, j)
    return Math.round(cost * SCALE) + (cost > 0 ? TIE_BREAK : 0)
  }
  const table: number[][] = Array.from({ length: expectedCount + 1 }, (_, i) =>
    Array.from({ length: typedCount + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0) * GAP),
  )
  const at = (i: number, j: number) => table[i]?.[j] ?? Infinity

  for (let i = 1; i <= expectedCount; i++) {
    for (let j = 1; j <= typedCount; j++) {
      table[i]![j] = Math.min(
        at(i - 1, j - 1) + pairCost(i - 1, j - 1),
        at(i - 1, j) + GAP,
        at(i, j - 1) + GAP,
      )
    }
  }

  const ops: AlignOp[] = []
  let i = expectedCount
  let j = typedCount
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && at(i, j) === at(i - 1, j - 1) + pairCost(i - 1, j - 1)) {
      i--
      j--
      ops.push({ kind: 'pair', expected: i, typed: j, cost: substitution(i, j) })
    } else if (i > 0 && at(i, j) === at(i - 1, j) + GAP) {
      ops.push({ kind: 'missing', expected: --i })
    } else {
      ops.push({ kind: 'extra', typed: --j })
    }
  }
  return ops.reverse()
}
