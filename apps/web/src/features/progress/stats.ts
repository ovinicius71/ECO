import type { ActivityDay, PracticeSession } from '@/types/practice'
import { addDays, toLocalDate, weekdayFromMonday } from './dates'

/**
 * Sequência (docs/spec/dados.md): dias seguidos até hoje com minutos > 0.
 * Se hoje ainda não tem atividade, a sequência conta até ontem.
 */
export function computeStreak(activity: readonly ActivityDay[], today: string): number {
  const active = new Set(activity.filter((day) => day.minutes > 0).map((day) => day.date))
  let day = active.has(today) ? today : addDays(today, -1)
  let streak = 0
  while (active.has(day)) {
    streak += 1
    day = addDays(day, -1)
  }
  return streak
}

const WEEK_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

/** Semana atual (segunda a domingo) com os dias praticados. */
export function weekActivity(activity: readonly ActivityDay[], today: string) {
  const monday = addDays(today, -weekdayFromMonday(today))
  const active = new Set(activity.filter((day) => day.minutes > 0).map((day) => day.date))
  return WEEK_LABELS.map((label, i) => {
    const date = addDays(monday, i)
    return { date, label, active: active.has(date) }
  })
}

export function minutesOn(activity: readonly ActivityDay[], day: string): number {
  return activity.find((entry) => entry.date === day)?.minutes ?? 0
}

/** Média de precisão das sessões dos últimos `days` dias (inclui hoje); null se não houver. */
export function averageAccuracy(
  sessions: readonly PracticeSession[],
  today: string,
  /** Dia local de um instante ISO (injetável nos testes). */
  toDay: (iso: string) => string = (iso) => toLocalDate(new Date(iso)),
  days = 30,
): number | null {
  const from = addDays(today, -(days - 1))
  const recent = sessions.filter((session) => toDay(session.endedAt) >= from)
  if (!recent.length) return null
  return recent.reduce((sum, session) => sum + session.accuracy, 0) / recent.length
}

/** Recorde só existe se havia uma sessão anterior para comparar. */
export function isNewRecord(accuracy: number, previousBest: number | null): boolean {
  return previousBest !== null && accuracy > previousBest
}
