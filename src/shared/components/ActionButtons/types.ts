export type ActionButtonSize = 'sm' | 'md';

export interface BaseActionButtonProps {
  readonly onClick?: () => void;
  readonly disabled?: boolean;
  readonly size?: ActionButtonSize;
  readonly iconOnly?: boolean;
  readonly ariaLabel?: string;
  readonly title?: string;
  readonly className?: string;
}

export interface EditButtonProps extends BaseActionButtonProps {
  readonly label?: string;
}

export interface DeleteButtonProps extends BaseActionButtonProps {
  readonly label?: string;
  readonly loadingLabel?: string;
  readonly isDeleting?: boolean;
}
