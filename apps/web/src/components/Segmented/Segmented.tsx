import { useRef, type KeyboardEvent } from 'react'
import { cx } from '@/lib/utils/cx'
import styles from './Segmented.module.css'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface SegmentedProps<T extends string> {
  /** Nome acessível do grupo, ex.: "Velocidade". */
  label: string
  options: readonly SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
}

const STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

/** Grupo de opções exclusivas (radiogroup). As setas trocam a opção, como num rádio nativo. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])
  const current = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )

  function onKeyDown(event: KeyboardEvent) {
    const step = STEP[event.key]
    if (!step) return
    event.preventDefault()
    const next = (current + step + options.length) % options.length
    const option = options[next]
    if (!option) return
    onChange(option.value)
    refs.current[next]?.focus()
  }

  return (
    <div role="radiogroup" aria-label={label} className={styles.group} onKeyDown={onKeyDown}>
      {options.map((option, index) => {
        const checked = index === current
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            className={cx(styles.option, checked && styles.checked)}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
