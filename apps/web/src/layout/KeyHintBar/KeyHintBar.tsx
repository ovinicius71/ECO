import type { ReactNode } from 'react'
import styles from './KeyHintBar.module.css'

export interface KeyHint {
  /** Texto da tecla como aparece na caixa, ex.: "CTRL V", "↑ ↓". */
  keys: string
  /** Ação em caixa alta, ex.: "COLAR LINK". */
  label: string
}

interface KeyHintBarProps {
  hints: readonly KeyHint[]
  /** Texto à direita, ex.: "SALVO NESTE NAVEGADOR". */
  aside?: ReactNode
}

/** Barra de atalhos do rodapé. Mostra só; os atalhos são tratados por cada tela. */
export function KeyHintBar({ hints, aside }: KeyHintBarProps) {
  return (
    <footer className={styles.bar}>
      <ul className={styles.list} aria-label="Atalhos de teclado">
        {hints.map((hint) => (
          <li key={hint.keys}>
            <kbd className={styles.key}>{hint.keys}</kbd>
            {hint.label}
          </li>
        ))}
      </ul>
      {aside && <span className={styles.aside}>{aside}</span>}
    </footer>
  )
}
