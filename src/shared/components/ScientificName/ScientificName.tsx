import './scientificName.css';

interface Props {
  readonly children: React.ReactNode;
  readonly variant?: 'secondary' | 'title';
}

export default function ScientificName({
  children,
  variant = 'secondary'
}: Props) {
  const className =
    variant === 'title'
      ? 'scientific-name scientific-name--title'
      : 'scientific-name';

  return <span className={className}>{children}</span>;
}
