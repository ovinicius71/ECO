import { useRef, type KeyboardEvent } from 'react'
import { cx } from '@/lib/utils/cx'
import styles from './CategoryTabs.module.css'
import { tabId, tabPanelId } from './ids'

export interface CategoryTab<T extends string> {
  id: T
  label: string
}

interface CategoryTabsProps<T extends string> {
  /** Nome acessível, ex.: "Biblioteca". */
  label: string
  tabs: readonly CategoryTab<T>[]
  value: T
  onChange: (id: T) => void
  /** Prefixo dos ids: aba `${idBase}-tab-${id}`, painel `${idBase}-panel-${id}`. */
  idBase: string
}

/** Abas grandes de categoria; as inativas em ink-3. ← → trocam (ativação automática). */
export function CategoryTabs<T extends string>({
  label,
  tabs,
  value,
  onChange,
  idBase,
}: CategoryTabsProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])
  const current = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === value),
  )

  function onKeyDown(event: KeyboardEvent) {
    const last = tabs.length - 1
    const next = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    }[event.key]
    const tab = next === undefined ? undefined : tabs[next]
    if (next === undefined || !tab) return
    event.preventDefault()
    onChange(tab.id)
    refs.current[next]?.focus()
  }

  return (
    <div role="tablist" aria-label={label} className={styles.tabs} onKeyDown={onKeyDown}>
      {tabs.map((tab, index) => {
        const selected = index === current
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[index] = el
            }}
            id={tabId(idBase, tab.id)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={tabPanelId(idBase, tab.id)}
            tabIndex={selected ? 0 : -1}
            className={cx(styles.tab, selected && styles.selected)}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
