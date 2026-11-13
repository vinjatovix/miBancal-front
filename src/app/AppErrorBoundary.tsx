import { Component, type ReactNode } from 'react';

import {
  reportUnexpectedError,
  toUnexpectedErrorReport
} from '../shared/observability/reportUnexpectedError';
import { AppErrorScreen } from './AppErrorScreen';

type AppErrorBoundaryProps = {
  readonly children: ReactNode;
};

type AppErrorBoundaryState = {
  readonly hasError: boolean;
};

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    reportUnexpectedError(
      toUnexpectedErrorReport(error, { kind: 'render', section: 'app' }),
      error
    );
  }

  render() {
    return this.state.hasError ? <AppErrorScreen /> : this.props.children;
  }
}
