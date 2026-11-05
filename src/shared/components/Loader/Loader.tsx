import { t } from '../../../i18n/core/t';
import type { I18nKey } from '../../../i18n/core/types';
import './loader.css';

type LoaderProps = {
  labelKey?: I18nKey;
};

export const Loader = ({ labelKey = 'common.loading' }: LoaderProps) => {
  return (
    <div className="rain-loader" role="status">
      <span className="sr-only">{t(labelKey)}</span>
      <div className="cloud" aria-hidden="true"></div>
      <div className="sun" aria-hidden="true"></div>

      <div className="rain" aria-hidden="true">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </div>

      <div className="soil" aria-hidden="true"></div>

      <div className="plant" aria-hidden="true">
        <div className="seed" aria-hidden="true"></div>
        <div className="stem" aria-hidden="true"></div>

        <div className="leaf left" aria-hidden="true"></div>
        <div className="leaf right" aria-hidden="true"></div>

        <div className="flower" aria-hidden="true">
          <div className="petal p1" aria-hidden="true"></div>
          <div className="petal p2" aria-hidden="true"></div>
          <div className="petal p3" aria-hidden="true"></div>
          <div className="petal p4" aria-hidden="true"></div>
          <div className="petal p5" aria-hidden="true"></div>
          <div className="petal p6" aria-hidden="true"></div>
          <div className="petal p7" aria-hidden="true"></div>
          <div className="petal p8" aria-hidden="true"></div>
          <div className="center" aria-hidden="true"></div>
        </div>

        <div className="falling-seed" aria-hidden="true"></div>
      </div>
    </div>
  );
};
