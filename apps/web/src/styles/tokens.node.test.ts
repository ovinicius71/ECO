// @vitest-environment node
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

describe('tokens.css', () => {
  it('é cópia idêntica de design/tokens.css', () => {
    const app = read('./tokens.css')
    expect(app).toContain('--eco-paper:')
    expect(app).toBe(read('../../../../design/tokens.css'))
  })
})
