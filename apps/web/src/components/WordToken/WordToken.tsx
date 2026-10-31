import { cx } from '@/lib/utils/cx'
import styles from './WordToken.module.css'

export type WordTokenStatus = 'ok' | 'near' | 'wrong' | 'missing'

interface WordTokenProps {
  expected: string
  status: WordTokenStatus
  typed?: string
  hint?: 'merge' | 'split' | 'number' | 'contraction'
  /** Só o sublinhado, sem o digitado embaixo (lista de versos anteriores). */
  compact?: boolean
}

const HINT_TEXT = {
  merge: 'é uma palavra só',
  split: 'são duas palavras',
  number: 'número por extenso',
  contraction: 'contração',
} as const

function describe(status: WordTokenStatus, typed: string | undefined): string {
  switch (status) {
    case 'ok':
      return ''
    case 'near':
      return `quase: você digitou ${typed ?? ''}`
    case 'wrong':
      return `errado: você digitou ${typed ?? ''}`
    case 'missing':
      return 'faltou'
  }
}

/**
 * Palavra corrigida: `ok` normal, `near` com sublinhado tracejado, `wrong` com sublinhado
 * vermelhão e o digitado riscado embaixo, `missing` com "—" embaixo.
 */
export function WordToken({ expected, status, typed, hint, compact = false }: WordTokenProps) {
  const spoken = [describe(status, typed), hint && HINT_TEXT[hint]].filter(Boolean).join('; ')
  const showTyped = !compact && (status === 'wrong' || status === 'missing')

  return (
    <span className={cx(styles.token, styles[status])} title={spoken || undefined}>
      <span className={styles.word}>{expected}</span>
      {showTyped && (
        <span className={styles.typed} aria-hidden="true">
          {status === 'missing' ? '—' : typed}
        </span>
      )}
      {spoken && <span className="sr-only"> ({spoken})</span>}
    </span>
  )
}
