import type { PlayerController, PlayerEvents } from './controller'

// Tipos mínimos da IFrame Player API (https://developers.google.com/youtube/iframe_api_reference).
interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  setPlaybackRate(rate: number): void
  getCurrentTime(): number
  getDuration(): number
  getAvailablePlaybackRates(): number[]
  destroy(): void
}

interface YTNamespace {
  Player: new (
    element: HTMLElement,
    options: {
      host?: string
      videoId: string
      width?: string
      height?: string
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: () => void
        onStateChange?: (event: { data: number }) => void
        onError?: (event: { data: number }) => void
      }
    },
  ) => YTPlayer
  PlayerState: { PLAYING: number }
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

const API_URL = 'https://www.youtube.com/iframe_api'
// Modo de privacidade aprimorada do YouTube.
const HOST = 'https://www.youtube-nocookie.com'

const ERRORS: Record<number, string> = {
  2: 'O link do vídeo é inválido.',
  5: 'O navegador não conseguiu tocar este vídeo.',
  100: 'O vídeo foi removido ou é privado.',
  101: 'Este vídeo não permite reprodução fora do YouTube.',
  150: 'Este vídeo não permite reprodução fora do YouTube.',
}

let apiPromise: Promise<YTNamespace> | null = null

/** Carrega a IFrame API uma vez só (é a única chamada externa direta permitida no front). */
export function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  apiPromise ??= new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve(window.YT!)
    }
    const script = document.createElement('script')
    script.src = API_URL
    script.async = true
    script.onerror = () => {
      apiPromise = null
      reject(new Error('Não foi possível carregar o player do YouTube.'))
    }
    document.head.append(script)
  })
  return apiPromise
}

/**
 * Cria o player dentro de `container` (num `div` próprio, que o YouTube troca pelo iframe).
 * Os métodos do controlador são seguros antes do `onReady`: viram no-op.
 */
export async function createYouTubePlayer(
  container: HTMLElement,
  videoId: string,
  events: PlayerEvents,
  options: { controls: boolean },
): Promise<PlayerController> {
  const YT = await loadYouTubeApi()
  const mount = document.createElement('div')
  container.append(mount)

  let ready = false
  const player = new YT.Player(mount, {
    host: HOST,
    videoId,
    width: '100%',
    height: '100%',
    playerVars: {
      controls: options.controls ? 1 : 0,
      disablekb: options.controls ? 0 : 1,
      rel: 0,
      playsinline: 1,
      origin: window.location.origin,
    },
    events: {
      onReady: () => {
        ready = true
        events.onReady()
      },
      onStateChange: (event) => events.onPlayingChange(event.data === YT.PlayerState.PLAYING),
      onError: (event) => events.onError(ERRORS[event.data] ?? 'Erro no player do YouTube.'),
    },
  })

  return {
    play: () => ready && player.playVideo(),
    pause: () => ready && player.pauseVideo(),
    seekTo: (videoMs) => ready && player.seekTo(videoMs / 1000, true),
    setRate: (rate) => ready && player.setPlaybackRate(rate),
    getTimeMs: () => (ready ? player.getCurrentTime() * 1000 : 0),
    getDurationMs: () => (ready ? player.getDuration() * 1000 : 0),
    getAvailableRates: () => (ready ? player.getAvailablePlaybackRates() : [1]),
    destroy: () => {
      player.destroy()
      // O destroy remove o iframe; garante que o div de montagem também saia.
      container.querySelectorAll(':scope > *').forEach((child) => child.remove())
    },
  }
}
