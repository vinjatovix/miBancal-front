import Icon from '../../../../shared/components/Icon/Icon';
import type { IconName } from '../../../../shared/components/Icon/iconPaths';
import './calendarRow.css';

interface Props {
  readonly label: string;
  readonly icon?: IconName;
  readonly children: React.ReactNode;
}

export default function CalendarRow({ label, icon, children }: Props) {
  return (
    <div className="calendar-row">
      <div className="calendar-row__label">
        {icon && <Icon name={icon} decorative />}
        {icon ? ` ${label}` : label}
      </div>
      <div className="calendar-row__value">{children}</div>
    </div>
  );
}
