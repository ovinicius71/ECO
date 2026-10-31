import { useEffect } from 'react'
import type { PlayerEngine } from './engine'

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement

/**
 * Atalhos globais da prática (docs/spec/produto.md):
 * Ctrl+Espaço pausa/continua, Ctrl+↓/↑ muda a velocidade, Tab repete o verso e Ctrl+H dá a dica.
 * O Tab só é capturado no corpo da página ou num campo de digitação, para não
 * quebrar a navegação por teclado nos botões (Shift+Tab nunca é capturado).
 */
interface ShortcutOptions {
  /** Substitui o "repetir verso" padrão (ex.: o Ditado repete o verso-alvo, não o que está tocando). */
  onReplay?: () => void
  /** Ctrl+H (dica), nos modos que têm dica. */
  onHint?: () => void
}

export function usePracticeShortcuts(engine: PlayerEngine, options: ShortcutOptions = {}) {
  const { onReplay, onHint } = options
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey && event.code === 'Space') {
        event.preventDefault()
        engine.togglePlay()
      } else if (event.ctrlKey && event.key === 'ArrowDown') {
        event.preventDefault()
        engine.stepRate(-1)
      } else if (event.ctrlKey && event.key === 'ArrowUp') {
        event.preventDefault()
        engine.stepRate(1)
      } else if (
        event.key === 'Tab' &&
        !event.shiftKey &&
        (event.target === document.body || isTyping(event.target))
      ) {
        event.preventDefault()
        if (onReplay) onReplay()
        else engine.replayLine()
      } else if (onHint && event.ctrlKey && event.key.toLowerCase() === 'h') {
        event.preventDefault()
        onHint()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [engine, onReplay, onHint])
}
