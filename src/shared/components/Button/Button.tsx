import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../Icon/Icon';
import type { IconName } from '../Icon/iconPaths';
import './button.css';

export type ButtonVariant = 'primary' | 'success' | 'danger' | 'neutral';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface BaseButtonProps {
  readonly icon?: IconName;
  readonly iconPosition?: 'start' | 'end';
  readonly variant?: ButtonVariant;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly children?: ReactNode;
  readonly className?: string;
}

export type ButtonAsButtonProps = BaseButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
    readonly to?: undefined;
  };

export type ButtonAsLinkProps = BaseButtonProps & {
  readonly to: string;
  readonly onClick?: () => void;
  readonly 'aria-label'?: string;
  readonly title?: string;
  readonly target?: string;
  readonly rel?: string;
};

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export default function Button({
  icon,
  iconPosition = 'start',
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
  to,
  ...restProps
}: ButtonProps) {
  const classes = [
    'app-button',
    `app-button--${variant}`,
    `app-button--${size}`,
    className
  ]
    .filter(Boolean)
    .join(' ');

  const iconElement = icon ? (
    <span className="app-button__icon">
      <Icon name={icon} decorative />
    </span>
  ) : null;

  const content = (
    <>
      {iconPosition === 'start' && iconElement}
      {children && <span className="app-button__label">{children}</span>}
      {iconPosition === 'end' && iconElement}
    </>
  );

  if (to !== undefined) {
    const linkProps = restProps as Omit<
      ButtonAsLinkProps,
      keyof BaseButtonProps | 'to'
    >;
    return (
      <Link to={to} className={classes} {...linkProps}>
        {content}
      </Link>
    );
  }

  const { type = 'button', ...buttonProps } = restProps as ButtonAsButtonProps;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
