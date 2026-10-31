import type { ReactNode } from 'react'

// Traço fino, sem preenchimento (design/README.md §5). Adicione novos ícones aqui.
const paths = {
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  flame: <path d="M12 3c1 4 5 6 5 11a5 5 0 0 1-10 0c0-3 2-4 2-7 2 1 3 3 3 5" />,
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof paths

interface IconProps {
  name: IconName
  size?: number
  className?: string
}

/** Ícone decorativo. Botões só com ícone precisam de `aria-label` no próprio botão. */
export function Icon({ name, size = 16, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  )
}
