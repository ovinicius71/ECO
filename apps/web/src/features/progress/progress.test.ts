import { describe, expect, it } from 'vitest'
import { scoreLine } from '@/features/correction'
import type { ActivityDay, PracticeSession } from '@/types/practice'
import type { Song } from '@/types/song'
import { createPracticeClock } from './clock'
import { addDays, toLocalDate, weekdayFromMonday } from './dates'
import { favoriteEntries, recentEntries } from './library'
import { barKind, reviewNote } from './review'
import { averageAccuracy, computeStreak, isNewRecord, minutesOn, weekActivity } from './stats'

const day = (date: string, minutes = 5): ActivityDay => ({ date, minutes, sessions: 1 })

describe('datas locais', () => {
  it('formata no fuso local e soma dias atravessando meses', () => {
    expect(toLocalDate(new Date(2026, 9, 31, 23, 59))).toBe('2026-10-31')
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
    expect(weekdayFromMonday('2026-10-31')).toBe(5) // sábado
    expect(weekdayFromMonday('2026-11-02')).toBe(0) // segunda
  })
})

describe('sequência', () => {
  it('conta os dias seguidos até hoje', () => {
    expect(
      computeStreak([day('2026-10-29'), day('2026-10-30'), day('2026-10-31')], '2026-10-31'),
    ).toBe(3)
  })

  it('sem atividade hoje, conta até ontem', () => {
    expect(computeStreak([day('2026-10-29'), day('2026-10-30')], '2026-10-31')).toBe(2)
  })

  it('quebra com um dia vazio, e minutos 0 não contam', () => {
    expect(
      computeStreak([day('2026-10-28'), day('2026-10-30'), day('2026-10-31')], '2026-10-31'),
    ).toBe(2)
    expect(computeStreak([day('2026-10-31', 0)], '2026-10-31')).toBe(0)
    expect(computeStreak([], '2026-10-31')).toBe(0)
  })
})

describe('semana e meta', () => {
  it('segunda a domingo da semana atual, marcando os dias praticados', () => {
    const week = weekActivity(
      [day('2026-10-26'), day('2026-10-31'), day('2026-10-25')],
      '2026-10-31',
    )
    expect(week.map((d) => d.date)).toEqual([
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
    ])
    expect(week.map((d) => d.active)).toEqual([true, false, false, false, false, true, false])
    expect(week.map((d) => d.label).join('')).toBe('STQQSSD')
  })

  it('minutos de um dia', () => {
    expect(minutesOn([day('2026-10-31', 14)], '2026-10-31')).toBe(14)
    expect(minutesOn([], '2026-10-31')).toBe(0)
  })
})

const session = (endedAt: string, accuracy: number, extra: Partial<PracticeSession> = {}) =>
  ({
    id: endedAt,
    videoId: 'v1',
    mode: 'ditado',
    title: 'Paper Moon Radio',
    artist: 'The Quiet Arcade',
    endedAt,
    accuracy,
    ...extra,
  }) as PracticeSession

describe('precisão média e recorde', () => {
  const toDay = (iso: string) => iso.slice(0, 10)

  it('média dos últimos 30 dias', () => {
    const sessions = [
      session('2026-10-31T10:00:00', 0.9),
      session('2026-10-02T10:00:00', 0.7), // 30º dia, entra
      session('2026-10-01T10:00:00', 0.1), // 31º dia, fora
    ]
    expect(averageAccuracy(sessions, '2026-10-31', toDay, 30)).toBeCloseTo(0.8)
    expect(averageAccuracy([], '2026-10-31', toDay, 30)).toBeNull()
  })

  it('recorde só quando supera uma sessão anterior', () => {
    expect(isNewRecord(0.95, 0.9)).toBe(true)
    expect(isNewRecord(0.9, 0.9)).toBe(false)
    expect(isNewRecord(0.95, null)).toBe(false)
  })
})

describe('relógio de prática', () => {
  it('soma os intervalos e corta pausas longas em 2 min', () => {
    let now = 0
    const clock = createPracticeClock(() => now)
    clock.mark()
    now = 30_000
    clock.mark()
    now = 30_000 + 10 * 60_000 // 10 min parado
    clock.mark()
    expect(clock.elapsedMs()).toBe(30_000 + 120_000)
  })
})

describe('notas dos versos para rever', () => {
  it.each([
    [
      'Counting cars that never come',
      'counting cars that never comes',
      'Você escreveu “comes” — quase: “come”.',
    ],
    [
      'the night is almost gone',
      'the night is all most gone',
      'Você escreveu “all most” — “almost” é uma palavra só.',
    ],
    ['across the static sea', 'across the static', 'Faltou “sea”.'],
    ['across the static sea', 'across the static boat', 'Você escreveu “boat” no lugar de “sea”.'],
  ])('%s × %s', (expected, typed, note) => {
    expect(reviewNote(scoreLine(expected, typed, 'tolerant').words)).toBe(note)
  })

  it('verso certo não tem nota; barras por tipo', () => {
    const ok = scoreLine('the rain', 'the rain', 'tolerant')
    expect(reviewNote(ok.words)).toBeNull()
    expect(barKind(ok, false)).toBe('ok')
    expect(barKind(ok, true)).toBe('error')
    expect(barKind(scoreLine('come my way', 'comes my way', 'tolerant'), false)).toBe('near')
    expect(barKind(scoreLine('come my way', 'my way', 'tolerant'), false)).toBe('error')
  })
})

describe('Biblioteca', () => {
  const sessions = [
    session('2026-10-30T10:00:00', 0.8, { videoId: 'v1', mode: 'preencher' }),
    session('2026-10-31T10:00:00', 0.7, { videoId: 'v1', mode: 'ditado' }),
    session('2026-10-29T10:00:00', 0.9, {
      videoId: 'v2',
      title: 'Glass Garden',
      artist: 'Mira Vale',
    }),
  ]

  it('recentes: uma linha por música, último modo e melhor nota', () => {
    expect(recentEntries(sessions)).toEqual([
      expect.objectContaining({ videoId: 'v1', lastMode: 'ditado', best: 0.8 }),
      expect.objectContaining({ videoId: 'v2', title: 'Glass Garden', best: 0.9 }),
    ])
  })

  it('favoritas, inclusive as nunca praticadas', () => {
    const songs = [
      { videoId: 'v2', title: 'Glass Garden', artist: 'Mira Vale', favorite: true },
      { videoId: 'v3', title: 'Slow Satellite', artist: 'June Atlas', favorite: true },
      { videoId: 'v1', title: 'Paper Moon Radio', artist: 'The Quiet Arcade', favorite: false },
    ] as Song[]
    expect(favoriteEntries(songs, sessions).map((e) => [e.videoId, e.best])).toEqual([
      ['v2', 0.9],
      ['v3', null],
    ])
  })
})
