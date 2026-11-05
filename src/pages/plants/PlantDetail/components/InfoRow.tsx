import Icon from '../../../../shared/components/Icon/Icon';
import type { IconName } from '../../../../shared/components/Icon/iconPaths';
import './infoRow.css';

interface Props {
  readonly label: string;
  readonly icon?: IconName;
  readonly value: React.ReactNode;
  readonly className?: string;
}

export default function InfoRow({ label, icon, value, className }: Props) {
  return (
    <div className={className ? `info-row ${className}` : 'info-row'}>
      <strong className="info-row__label">
        {icon && <Icon name={icon} decorative />}
        {icon ? ` ${label}` : label}
      </strong>
      <span className="info-row__value">{value}</span>
    </div>
  );
}
