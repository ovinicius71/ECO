import { describe, expect, it } from 'vitest'
import { buildDictationSession } from './record'
import { scoreAttempts } from './session'

// Versos inventados (fixture "Paper Moon Radio").
const lines = [
  { text: 'Like a radio that plays it all' },
  { text: 'Hold on, the night is almost gone' },
]

describe('buildDictationSession', () => {
  it('monta a sessão com o esperado de cada verso, nota, tempo e totais', () => {
    const scored = scoreAttempts(
      [
        {
          lineIndex: 0,
          typed: 'like a radyo that play it all',
          skipped: false,
          replays: 2,
          hintUsed: true,
        },
        { lineIndex: 1, typed: '', skipped: true, replays: 0, hintUsed: false },
      ],
      lines,
      'tolerant',
    )
    const session = buildDictationSession({
      id: 's1',
      song: {
        videoId: 'abcdefghijk',
        title: 'Paper Moon Radio',
        artist: 'The Quiet Arcade',
        lines,
      },
      scored,
      lineCount: 2,
      settings: { pauseAtEnd: true, rate: 0.75, correction: 'tolerant', lines: [0, 1] },
      correction: 'tolerant',
      startedAt: new Date('2026-10-31T10:00:00.000Z'),
      endedAt: new Date('2026-10-31T10:08:00.000Z'),
      activeMs: 301_400,
    })

    expect(session).toMatchObject({
      id: 's1',
      mode: 'ditado',
      title: 'Paper Moon Radio',
      settings: { pauseAtEnd: true, rate: 0.75, lines: '0,1' },
      startedAt: '2026-10-31T10:00:00.000Z',
      durationSec: 301,
      lineCount: 2,
      replays: 2,
      hintsUsed: 1,
    })
    expect(session.accuracy).toBeCloseTo(6 / 7 / 2)
    expect(session.lines[0]).toMatchObject({
      lineIndex: 0,
      expected: 'Like a radio that plays it all',
      hintsUsed: 1,
    })
    expect(session.lines[1]).toMatchObject({
      skipped: true,
      expected: 'Hold on, the night is almost gone',
    })
  })
})
