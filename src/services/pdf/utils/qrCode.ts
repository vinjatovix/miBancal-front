import type { jsPDF } from 'jspdf';

import { PDF_INK, PDF_PAPER } from './pdfTheme';

export type QrMatrix = readonly (readonly boolean[])[];

export async function createQrMatrix(url: string): Promise<QrMatrix> {
  const QRCode = await import('qrcode');
  const { modules } = QRCode.create(url, { errorCorrectionLevel: 'M' });
  const { size, data } = modules;

  const matrix: boolean[][] = [];
  for (let row = 0; row < size; row += 1) {
    const cells: boolean[] = [];
    for (let col = 0; col < size; col += 1) {
      cells.push(data[row * size + col] === 1);
    }
    matrix.push(cells);
  }
  return matrix;
}

export function drawQrMatrix(
  doc: jsPDF,
  matrix: QrMatrix,
  xMm: number,
  yMm: number,
  sizeMm: number
): void {
  const modulesPerSide = matrix.length;
  if (modulesPerSide === 0) return;

  const moduleMm = sizeMm / modulesPerSide;

  doc.setFillColor(...PDF_PAPER);
  doc.rect(xMm, yMm, sizeMm, sizeMm, 'F');

  doc.setFillColor(...PDF_INK);
  for (let row = 0; row < modulesPerSide; row += 1) {
    for (let col = 0; col < modulesPerSide; col += 1) {
      if (matrix[row][col]) {
        doc.rect(
          xMm + col * moduleMm,
          yMm + row * moduleMm,
          moduleMm,
          moduleMm,
          'F'
        );
      }
    }
  }
}
