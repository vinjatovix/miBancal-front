import type React from 'react';

import './icon.css';
import { ICON_GLYPHS, type IconName } from './iconPaths';

type BaseIconProps = {
  readonly name: IconName;
  readonly className?: string;
};

export type DecorativeIconProps = BaseIconProps & {
  readonly decorative: true;
  readonly label?: never;
};

export type SemanticIconProps = BaseIconProps & {
  readonly label: string;
  readonly decorative?: never;
};

export type IconProps = DecorativeIconProps | SemanticIconProps;

export default function Icon(props: IconProps): React.JSX.Element {
  const { name, className, decorative, label } = props;
  const classes = className ? `icon ${className}` : 'icon';
  const glyph = ICON_GLYPHS[name];

  if (decorative) {
    return (
      <svg
        className={classes}
        viewBox="0 0 36 36"
        width="1.25em"
        height="1.25em"
        focusable="false"
        aria-hidden="true"
      >
        {glyph}
      </svg>
    );
  }

  return (
    <svg
      className={classes}
      viewBox="0 0 36 36"
      width="1.25em"
      height="1.25em"
      focusable="false"
      role="img"
      aria-label={label}
    >
      {glyph}
    </svg>
  );
}
