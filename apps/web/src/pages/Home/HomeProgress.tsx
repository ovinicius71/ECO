import { useState } from 'react'
import { useNavigate } from 'react-router'
import { BoxMeter } from '@/components/BoxMeter/BoxMeter'
import { CategoryTabs } from '@/components/CategoryTabs/CategoryTabs'
import { tabId, tabPanelId } from '@/components/CategoryTabs/ids'
import { Gauge } from '@/components/Gauge/Gauge'
import { SelectList } from '@/components/SelectList/SelectList'
import { StatusPanel, StatusRow } from '@/components/StatusPanel/StatusPanel'
import {
  favoriteEntries,
  MODE_NAMES,
  recentEntries,
  type LibraryEntry,
} from '@/features/progress/library'
import { averageAccuracy, minutesOn, weekActivity } from '@/features/progress/stats'
import { useHomeProgress } from '@/features/progress/useProgress'
import styles from './Home.module.css'

/** Meta diária fixa até a tela de Ajustes (docs/spec/dados.md: padrão 20 min). */
const DAILY_GOAL_MIN = 20

type Tab = 'recentes' | 'favoritas'

const TABS = [
  { id: 'recentes', label: 'Recentes' },
  { id: 'favoritas', label: 'Favoritas' },
] as const

const EMPTY: Record<Tab, string> = {
  recentes: 'Nenhuma música praticada ainda. Cole um link acima para começar.',
  favoritas: 'Nenhuma favorita ainda. Marque uma música na tela dela.',
}

/** Biblioteca (Recentes/Favoritas) e painel STATUS da Home. */
export function HomeProgress() {
  const navigate = useNavigate()
  const progress = useHomeProgress()
  const [tab, setTab] = useState<Tab>('recentes')

  // Sem banco (navegador sem IndexedDB) ou carregando: a Home continua só com o topo.
  if (progress.status !== 'ready') return null
  const { sessions, songs, activity, today } = progress.data

  const entries = tab === 'recentes' ? recentEntries(sessions) : favoriteEntries(songs, sessions)
  const practiced = new Set(sessions.map((session) => session.videoId)).size
  const accuracy = averageAccuracy(sessions, today)
  const minutes = minutesOn(activity, today)
  const week = weekActivity(activity, today)
  const activeDays = week.filter((day) => day.active).length

  return (
    <section className={styles.progress} aria-label="Seu progresso">
      <div className={styles.library}>
        <CategoryTabs
          label="Biblioteca"
          idBase="library"
          tabs={TABS}
          value={tab}
          onChange={setTab}
        />
        <div
          role="tabpanel"
          id={tabPanelId('library', tab)}
          aria-labelledby={tabId('library', tab)}
          className={styles.libraryPanel}
        >
          {entries.length === 0 ? (
            <p className={styles.empty}>{EMPTY[tab]}</p>
          ) : (
            <SelectList
              key={tab}
              label={tab === 'recentes' ? 'Músicas recentes' : 'Músicas favoritas'}
              items={entries}
              getKey={(entry) => entry.videoId}
              onActivate={(entry) => navigate(`/musica/${entry.videoId}`)}
              renderItem={(entry, { index }) => <LibraryRow entry={entry} index={index} />}
            />
          )}
        </div>
      </div>

      <aside className={styles.status}>
        <StatusPanel>
          <StatusRow label="Músicas praticadas" value={practiced} />
          <StatusRow
            label="Precisão média"
            value={accuracy === null ? '—' : `${Math.round(accuracy * 100)}%`}
          />
        </StatusPanel>
        <p className={styles.statusLabel}>
          META DE HOJE · {Math.floor(minutes)} / {DAILY_GOAL_MIN} MIN
        </p>
        <Gauge value={minutes / DAILY_GOAL_MIN} label="Meta de hoje" />
        <p className={styles.statusLabel}>SEQUÊNCIA</p>
        <BoxMeter
          label={`Semana: praticou em ${activeDays} de 7 dias`}
          items={week.map((day) => ({ label: day.label, filled: day.active }))}
        />
      </aside>
    </section>
  )
}

function LibraryRow({ entry, index }: { entry: LibraryEntry; index: number }) {
  return (
    <>
      <span className={styles.rowNumber}>{String(index + 1).padStart(2, '0')}</span>
      <span className={styles.rowTitle}>{entry.title}</span>
      <span className={styles.rowArtist}>{entry.artist}</span>
      <span className={styles.rowMode}>
        {entry.lastMode ? MODE_NAMES[entry.lastMode].name.toUpperCase() : '—'}
      </span>
      <span className={styles.rowScore}>
        {entry.best === null ? '—' : `${Math.round(entry.best * 100)}%`}
      </span>
    </>
  )
}
