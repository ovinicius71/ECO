import { useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from 'react'
import { cx } from '@/lib/utils/cx'
import styles from './SelectList.module.css'

interface ListRowProps extends ComponentProps<'li'> {
  selected: boolean
}

/** Linha de lista; a selecionada fica em barra invertida. */
export function ListRow({ selected, className, ...rest }: ListRowProps) {
  return <li className={cx(styles.row, selected && styles.selected, className)} {...rest} />
}

interface SelectListProps<T> {
  /** Nome acessível da lista, ex.: "Recentes". */
  label: string
  items: readonly T[]
  getKey: (item: T) => string
  renderItem: (item: T, state: { index: number; selected: boolean }) => ReactNode
  /** Clique ou Enter/Espaço na linha. */
  onActivate?: (item: T, index: number) => void
  /** A barra mudou de linha (mouse, teclado ou clique). */
  onSelectedChange?: (item: T, index: number) => void
  defaultIndex?: number
}

/**
 * Lista com seleção estilo NieR: o mouse move a barra, ↑↓/Home/End movem a barra e o foco,
 * Enter ativa. O hover não move o foco, para não confundir leitores de tela.
 */
export function SelectList<T>({
  label,
  items,
  getKey,
  renderItem,
  onActivate,
  onSelectedChange,
  defaultIndex = 0,
}: SelectListProps<T>) {
  const [selected, setSelectedState] = useState(defaultIndex)
  // Ref além do estado: o foco programático dispara onFocus no mesmo tick, antes do re-render.
  const selectedRef = useRef(defaultIndex)
  const refs = useRef<Array<HTMLLIElement | null>>([])

  function setSelected(index: number) {
    if (index === selectedRef.current) return
    selectedRef.current = index
    setSelectedState(index)
    const item = items[index]
    if (item !== undefined) onSelectedChange?.(item, index)
  }

  function focusIndex(index: number) {
    setSelected(index)
    refs.current[index]?.focus()
  }

  function activate(index: number) {
    const item = items[index]
    if (item !== undefined) onActivate?.(item, index)
  }

  function onKeyDown(event: KeyboardEvent) {
    const last = items.length - 1
    const moves: Record<string, number> = {
      ArrowDown: Math.min(last, selected + 1),
      ArrowUp: Math.max(0, selected - 1),
      Home: 0,
      End: last,
    }
    if (event.key in moves) {
      event.preventDefault()
      focusIndex(moves[event.key] ?? selected)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      activate(selected)
    }
  }

  return (
    <ul role="listbox" aria-label={label} className={styles.list} onKeyDown={onKeyDown}>
      {items.map((item, index) => {
        const isSelected = index === selected
        return (
          <ListRow
            key={getKey(item)}
            ref={(el) => {
              refs.current[index] = el
            }}
            role="option"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            selected={isSelected}
            onMouseEnter={() => setSelected(index)}
            onFocus={() => setSelected(index)}
            onClick={() => {
              setSelected(index)
              activate(index)
            }}
          >
            {renderItem(item, { index, selected: isSelected })}
          </ListRow>
        )
      })}
    </ul>
  )
}
