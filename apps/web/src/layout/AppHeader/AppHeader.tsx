import { Link, NavLink } from 'react-router'
import { Chip } from '@/components/Chip/Chip'
import { Icon } from '@/components/Icon/Icon'
import { cx } from '@/lib/utils/cx'
import styles from './AppHeader.module.css'

const NAV = [
  { to: '/', label: 'ESTUDAR' },
  { to: '/vocabulario', label: 'VOCABULÁRIO' },
  { to: '/progresso', label: 'PROGRESSO' },
  { to: '/ajustes', label: 'AJUSTES' },
] as const

interface AppHeaderProps {
  /** Dias seguidos com prática. Sem valor, o chip não aparece. */
  streakDays?: number
}

/** Cabeçalho das telas fora da prática: logo, nav com o item ativo invertido e streak. */
export function AppHeader({ streakDays }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <span className={styles.wordmark}>ECO</span>
        <span lang="ja" className={styles.kana}>
          エコ
        </span>
      </Link>
      <nav aria-label="Principal" className={styles.nav}>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => cx(styles.link, isActive && styles.active)}
          >
            {item.label}
          </NavLink>
        ))}
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
