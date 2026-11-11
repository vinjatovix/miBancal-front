import type { jsPDF } from 'jspdf';

export interface PdfDocCall {
  readonly method: string;
  readonly args: readonly unknown[];
}

export interface PdfDocMock {
  readonly doc: jsPDF;
  readonly calls: readonly PdfDocCall[];
  callsOf(method: string): readonly PdfDocCall[];
}

const PT_TO_MM = 25.4 / 72;

export function createPdfDocMock(): PdfDocMock {
  const calls: PdfDocCall[] = [];
  let fontSize = 12;

  const record =
    (method: string) =>
    (...args: unknown[]): unknown => {
      calls.push({ method, args });
      return undefined;
    };

  const handler: Record<string, unknown> = {
    setDrawColor: record('setDrawColor'),
    setFillColor: record('setFillColor'),
    setTextColor: record('setTextColor'),
    setLineWidth: record('setLineWidth'),
    setLineDashPattern: record('setLineDashPattern'),
    rect: record('rect'),
    line: record('line'),
    circle: record('circle'),
    triangle: record('triangle'),
    text: record('text'),
    addPage: record('addPage'),
    setFont: record('setFont'),
    setFontSize: (size: number): unknown => {
      fontSize = size;
      calls.push({ method: 'setFontSize', args: [size] });
      return undefined;
    },
    getTextWidth: (text: string): number =>
      text.length * fontSize * PT_TO_MM * 0.5
  };

  const doc = handler as unknown as jsPDF;

  return {
    doc,
    calls,
    callsOf: (method: string) => calls.filter((call) => call.method === method)
  };
}

export function textStrings(mock: PdfDocMock): string[] {
  return mock.callsOf('text').map((call) => String(call.args[0]));
}
