import type React from 'react';

import Icon from '../Icon/Icon';
import type { IconName } from '../Icon/iconPaths';
import './Badge.css';

interface Props {
  readonly children: React.ReactNode;
  readonly variant?:
    | 'default'
    | 'family'
    | 'scientific'
    | 'alias'
    | 'unavailable'
    | 'deleted';
  readonly icon?: IconName;
}

export default function Badge({ children, variant = 'default', icon }: Props) {
  return (
    <span className={`badge badge--${variant}`}>
      {icon && <Icon name={icon} decorative className="badge__icon" />}
      {children}
    </span>
  );
}
