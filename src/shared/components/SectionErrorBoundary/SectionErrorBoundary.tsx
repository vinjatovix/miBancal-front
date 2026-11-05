import { Component, type ReactNode } from 'react';

import { t } from '../../../i18n/core/t';
import {
  reportUnexpectedError,
  toUnexpectedErrorReport
} from '../../observability/reportUnexpectedError';

import './sectionErrorBoundary.css';

type SectionErrorBoundaryProps = {
  readonly section: string;
  readonly children: ReactNode;
};

type SectionErrorBoundaryState = {
  readonly hasError: boolean;
};

export class SectionErrorBoundary extends Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  state: SectionErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SectionErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    reportUnexpectedError(
      toUnexpectedErrorReport(error, {
        kind: 'render',
        section: this.props.section
      }),
      error
    );
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <p role="alert" className="section-error">
        {t('errors.section.message')}
      </p>
    );
  }
}
