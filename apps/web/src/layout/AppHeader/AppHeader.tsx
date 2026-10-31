import { Link, useLocation } from 'react-router'
import { Chip } from '@/components/Chip/Chip'
import { Icon } from '@/components/Icon/Icon'
import { cx } from '@/lib/utils/cx'
import styles from './AppHeader.module.css'

const NAV = [
  // ESTUDAR cobre o fluxo de estudo inteiro: Home, tela da música e prática.
  { to: '/', label: 'ESTUDAR', prefixes: ['/musica/', '/praticar/'] },
  { to: '/vocabulario', label: 'VOCABULÁRIO', prefixes: [] },
  { to: '/progresso', label: 'PROGRESSO', prefixes: [] },
  { to: '/ajustes', label: 'AJUSTES', prefixes: [] },
] as const

function isActive(pathname: string, item: (typeof NAV)[number]): boolean {
  if (pathname === item.to) return true
  if (item.to !== '/' && pathname.startsWith(`${item.to}/`)) return true
  return item.prefixes.some((prefix) => pathname.startsWith(prefix))
}

interface AppHeaderProps {
  /** Dias seguidos com prática. Sem valor, o chip não aparece. */
  streakDays?: number
}

/** Cabeçalho das telas fora da prática: logo, nav com o item ativo invertido e streak. */
export function AppHeader({ streakDays }: AppHeaderProps) {
  const { pathname } = useLocation()
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <span className={styles.wordmark}>ECO</span>
        <span lang="ja" className={styles.kana}>
          エコ
        </span>
      </Link>
      <nav aria-label="Principal" className={styles.nav}>
        {NAV.map((item) => {
          const active = isActive(pathname, item)
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={cx(styles.link, active && styles.active)}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
      {streakDays !== undefined && (
        <Chip variant="square" icon={<Icon name="flame" size={14} className={styles.flame} />}>
          <span className="sr-only">Sequência: </span>
          {streakDays} {streakDays === 1 ? 'dia' : 'dias'}
        </Chip>
      )}
    </header>
  )
}
