import type { jsPDF } from 'jspdf';

import type { PdfGridLayer } from '../../../types/Export/BedPdfExport';
import type { ScaledBox } from '../utils/pdfGeometry';
import { PDF_GRID } from '../utils/pdfTheme';

interface GridLayerStyle {
  readonly lineWidthMm: number;
  readonly dashMm: readonly number[];
}

const COARSE_STYLE: GridLayerStyle = { lineWidthMm: 0.14, dashMm: [] };
const SUBDIVISION_STYLES: readonly GridLayerStyle[] = [
  { lineWidthMm: 0.1, dashMm: [1, 1] },
  { lineWidthMm: 0.08, dashMm: [0.6, 0.8] },
  { lineWidthMm: 0.06, dashMm: [0.4, 0.9] }
];

function styleForRank(rank: number): GridLayerStyle {
  if (rank === 0) return COARSE_STYLE;
  return SUBDIVISION_STYLES[Math.min(rank - 1, SUBDIVISION_STYLES.length - 1)];
}

function drawVerticalLines(
  doc: jsPDF,
  box: ScaledBox,
  widthCm: number,
  intervalCm: number
): void {
  const top = box.offsetYMm;
  const bottom = box.offsetYMm + box.heightMm;
  for (let xCm = intervalCm; xCm < widthCm; xCm += intervalCm) {
    const x = box.offsetXMm + xCm * box.scale;
    doc.line(x, top, x, bottom);
  }
}

function drawHorizontalLines(
  doc: jsPDF,
  box: ScaledBox,
  heightCm: number,
  intervalCm: number
): void {
  const left = box.offsetXMm;
  const right = box.offsetXMm + box.widthMm;
  for (let yCm = intervalCm; yCm < heightCm; yCm += intervalCm) {
    const y = box.offsetYMm + yCm * box.scale;
    doc.line(left, y, right, y);
  }
}

export function renderBedGrid(
  doc: jsPDF,
  box: ScaledBox,
  widthCm: number,
  heightCm: number,
  layers: readonly PdfGridLayer[]
): void {
  const drawable = layers
    .filter((layer) => layer.stepCm > 0)
    .slice()
    .sort((a, b) => b.stepCm - a.stepCm);
  if (drawable.length === 0) return;

  doc.setDrawColor(...PDF_GRID);
  drawable.forEach((layer, rank) => {
    const style = styleForRank(rank);
    doc.setLineWidth(style.lineWidthMm);
    doc.setLineDashPattern([...style.dashMm], 0);
    drawVerticalLines(doc, box, widthCm, layer.stepCm);
    drawHorizontalLines(doc, box, heightCm, layer.stepCm);
  });
  doc.setLineDashPattern([], 0);
}
