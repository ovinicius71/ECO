import type { ReactNode } from 'react'

// Traço fino, sem preenchimento (design/README.md §5). Adicione novos ícones aqui.
const paths = {
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  flame: <path d="M12 3c1 4 5 6 5 11a5 5 0 0 1-10 0c0-3 2-4 2-7 2 1 3 3 3 5" />,
  pause: <path d="M8 5v14M16 5v14" />,
  replay: <path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4" />,
  /** Triângulo de play, sem o círculo (botão redondo da PlayerBar). */
  playSolid: <path d="M8 5.5v13l10.5-6.5z" />,
  play: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M10 8.5v7l6-3.5z" />
    </>
  ),
  youtube: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="3" />
      <path d="M10 9.5v5l4.5-2.5z" />
    </>
  ),
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof paths

interface IconProps {
  name: IconName
  size?: number
  /** Traço fino do design: 1.6–2px. */
  strokeWidth?: number
  className?: string
}

/** Ícone decorativo. Botões só com ícone precisam de `aria-label` no próprio botão. */
export function Icon({ name, size = 16, strokeWidth = 2, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  )
}
