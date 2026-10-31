import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '@/lib/utils/cx'
import styles from './Chip.module.css'

/** `solid`/`dashed`: pílulas (idiomas da Home). `square`: caixa mono (streak do cabeçalho). */
export type ChipVariant = 'solid' | 'dashed' | 'square'

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant
  icon?: ReactNode
  children: ReactNode
}

export function Chip({ variant = 'solid', icon, children, className, ...rest }: ChipProps) {
  return (
    <span className={cx(styles.chip, styles[variant], className)} {...rest}>
      {icon}
      {children}
    </span>
  )
}
