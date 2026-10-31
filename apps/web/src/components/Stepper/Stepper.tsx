import { useId } from 'react'
import styles from './Stepper.module.css'

interface StepperProps {
  /** Rótulo em caixa alta, ex.: "AJUSTE DE SINCRONIA". */
  label: string
  /** Valor já formatado, ex.: "−0,4 s". */
  value: string
  decrementLabel: string
  incrementLabel: string
  onDecrement: () => void
  onIncrement: () => void
}

/** Caixa − valor + com borda forte (ajuste de sincronia do Setup). */
export function Stepper({
  label,
  value,
  decrementLabel,
  incrementLabel,
  onDecrement,
  onIncrement,
}: StepperProps) {
  const labelId = useId()
  return (
    <div role="group" aria-labelledby={labelId} className={styles.stepper}>
      <p id={labelId} className={styles.label}>
        {label}
      </p>
      <div className={styles.box}>
        <button
          type="button"
          className={styles.button}
          aria-label={decrementLabel}
          onClick={onDecrement}
        >
          −
        </button>
        <output className={styles.value} aria-live="polite">
          {value}
        </output>
        <button
          type="button"
          className={styles.button}
          aria-label={incrementLabel}
          onClick={onIncrement}
        >
          +
        </button>
      </div>
    </div>
  )
}
