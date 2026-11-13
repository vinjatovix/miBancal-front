import type { ReactNode } from 'react';

import Icon from '../Icon/Icon';
import type { IconName } from '../Icon/iconPaths';
import './bodySection.css';

interface Props {
  readonly title: string;
  readonly icon?: IconName;
  readonly children: ReactNode;
}

export default function BodySection({ title, icon, children }: Props) {
  return (
    <section
      className="body-section"
      data-testid={`section-${title.toLowerCase()}`}
    >
      <h2 className="body-section__title">
        {icon && <Icon name={icon} decorative />}
        {icon ? ` ${title}` : title}
      </h2>

      <div className="body-section__content">{children}</div>
    </section>
  );
}
