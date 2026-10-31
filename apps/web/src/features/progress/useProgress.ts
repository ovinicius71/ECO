import { listActivity, listSessions } from '@/lib/db/sessions'
import { listSongs } from '@/lib/db/songs'
import { useDbQuery } from '@/lib/db/useDbQuery'
import { addDays, toLocalDate } from './dates'
import { computeStreak } from './stats'

/** Sequência atual de dias (undefined enquanto carrega ou se o banco falhar). */
export function useStreak(): number | undefined {
  const today = toLocalDate(new Date())
  const query = useDbQuery(() => listActivity(addDays(today, -400), today), [today])
  return query.status === 'ready' ? computeStreak(query.data, today) : undefined
}

/** Tudo o que a Home precisa: sessões, músicas e a atividade recente. */
export function useHomeProgress() {
  const today = toLocalDate(new Date())
  return useDbQuery(
    async () => ({
      today,
      sessions: await listSessions(),
      songs: await listSongs(),
      activity: await listActivity(addDays(today, -400), today),
    }),
    [today],
  )
}
