import type { ComponentProps, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { Icon, type IconName } from '@/components/Icon/Icon'
import { cx } from '@/lib/utils/cx'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'outline' | 'ghost'

interface CommonProps {
  variant?: ButtonVariant
  /** Ícone à direita do texto (ex.: `arrowRight` em "BUSCAR LETRA"). */
  icon?: IconName
  children: ReactNode
}

function Content({ icon, children }: Pick<CommonProps, 'icon' | 'children'>) {
  return (
    <>
      <span>{children}</span>
      {icon && <Icon name={icon} />}
    </>
  )
}

export function Button({
  variant = 'primary',
  icon,
  children,
  className,
  type = 'button',
  ...rest
}: CommonProps & ComponentProps<'button'>) {
  return (
    <button type={type} className={cx(styles.button, styles[variant], className)} {...rest}>
      <Content icon={icon}>{children}</Content>
    </button>
  )
}

/** Mesmo visual do Button, mas navega (React Router). */
export function ButtonLink({
  variant = 'primary',
  icon,
  children,
  className,
  ...rest
}: CommonProps & Omit<LinkProps, 'children'>) {
  return (
    <Link className={cx(styles.button, styles[variant], className)} {...rest}>
      <Content icon={icon}>{children}</Content>
    </Link>
  )
}
