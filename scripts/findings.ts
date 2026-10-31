export interface Finding {
  readonly file?: string;
  readonly line?: number;
  readonly message: string;
}

export function formatFinding(finding: Finding): string {
  const location = [finding.file, finding.line]
    .filter((part) => part !== undefined)
    .join(':');
  return location ? `${location} - ${finding.message}` : finding.message;
}
