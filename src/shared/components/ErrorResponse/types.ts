import type { FailureKind } from '../../errors/classifyFailure';

export interface UiError {
  kind: FailureKind;
  message: string;
}
