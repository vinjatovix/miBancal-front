import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface CompanionContainerProps {
  readonly to: string | null;
  readonly className: string;
  readonly children: ReactNode;
}

export default function CompanionContainer({
  to,
  className,
  children
}: CompanionContainerProps) {
  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  return <div className={className}>{children}</div>;
}
