import type { jsPDF } from 'jspdf';

import { t } from '../../../i18n/core/t';
import type { SpeciesSummaryItem } from '../../../types/Export/BedPdfExport';
import type { ContentArea } from '../utils/pdfGeometry';
import {
  FONT_FAMILY,
  FONT_SIZE_TABLE_BODY_PT,
  FONT_SIZE_TABLE_HEADER_PT,
  LINE_WEIGHT_DIMENSION_MM,
  PDF_INK,
  PDF_INK_MUTED,
  PDF_TABLE_HEADER_FILL
} from '../utils/pdfTheme';

const DASH = '—';
const HEADER_HEIGHT_MM = 7;
const ROW_HEIGHT_MM = 6;
const CELL_PADDING_MM = 1.5;
const COLUMN_GAP_MM = 6;

type ColumnKey = 'key' | 'crop' | 'scientific' | 'family' | 'units';

interface ColumnSpec {
  readonly key: ColumnKey;
  readonly weight: number;
  readonly align: 'left' | 'center' | 'right';
  readonly italic: boolean;
  value(item: SpeciesSummaryItem): string;
}

interface Column extends ColumnSpec {
  readonly label: string;
  readonly xMm: number;
  readonly widthMm: number;
}

const COLUMN_SPECS: readonly ColumnSpec[] = [
  {
    key: 'key',
    weight: 0.1,
    align: 'center',
    italic: false,
    value: (item) => item.key
  },
  {
    key: 'crop',
    weight: 0.28,
    align: 'left',
    italic: false,
    value: (item) => item.commonName
  },
  {
    key: 'scientific',
    weight: 0.29,
    align: 'left',
    italic: true,
    value: (item) => item.scientificName ?? DASH
  },
  {
    key: 'family',
    weight: 0.23,
    align: 'left',
    italic: false,
    value: (item) => item.familyName ?? DASH
  },
  {
    key: 'units',
    weight: 0.1,
    align: 'right',
    italic: false,
    value: (item) => String(item.count)
  }
];

export interface SpeciesTableResult {
  readonly endYMm: number;
  readonly rowsPerColumn: number;
  readonly overflow: readonly SpeciesSummaryItem[];
}

function buildColumns(xMm: number, widthMm: number): readonly Column[] {
  let cursor = xMm;
  return COLUMN_SPECS.map((spec) => {
    const columnWidth = widthMm * spec.weight;
    const column: Column = {
      ...spec,
      label: t(`bed.export.pdf_table_${spec.key}`),
      xMm: cursor,
      widthMm: columnWidth
    };
    cursor += columnWidth;
    return column;
  });
}

function truncate(doc: jsPDF, text: string, maxWidthMm: number): string {
  if (doc.getTextWidth(text) <= maxWidthMm) return text;
  let value = text;
  while (value.length > 1 && doc.getTextWidth(`${value}…`) > maxWidthMm) {
    value = value.slice(0, -1);
  }
  return `${value}…`;
}

function cellX(column: Column): number {
  if (column.align === 'center') return column.xMm + column.widthMm / 2;
  if (column.align === 'right') {
    return column.xMm + column.widthMm - CELL_PADDING_MM;
  }
  return column.xMm + CELL_PADDING_MM;
}

function drawHeader(
  doc: jsPDF,
  columns: readonly Column[],
  xMm: number,
  widthMm: number,
  topMm: number
): void {
  doc.setFillColor(...PDF_TABLE_HEADER_FILL);
  doc.rect(xMm, topMm, widthMm, HEADER_HEIGHT_MM, 'F');
  doc.setTextColor(...PDF_INK);
  doc.setFont(FONT_FAMILY, 'bold');
  doc.setFontSize(FONT_SIZE_TABLE_HEADER_PT);
  const baseline = topMm + HEADER_HEIGHT_MM / 2;
  for (const column of columns) {
    doc.text(column.label, cellX(column), baseline, {
      align: column.align,
      baseline: 'middle'
    });
  }
}

function drawRow(
  doc: jsPDF,
  columns: readonly Column[],
  item: SpeciesSummaryItem,
  topMm: number
): void {
  const baseline = topMm + ROW_HEIGHT_MM / 2;
  doc.setTextColor(...PDF_INK);
  doc.setFontSize(FONT_SIZE_TABLE_BODY_PT);
  for (const column of columns) {
    doc.setFont(FONT_FAMILY, column.italic ? 'italic' : 'normal');
    const value = truncate(
      doc,
      column.value(item),
      column.widthMm - CELL_PADDING_MM * 2
    );
    doc.text(value, cellX(column), baseline, {
      align: column.align,
      baseline: 'middle'
    });
  }
}

function renderBlock(
  doc: jsPDF,
  xMm: number,
  widthMm: number,
  topMm: number,
  items: readonly SpeciesSummaryItem[]
): number {
  const columns = buildColumns(xMm, widthMm);
  doc.setDrawColor(...PDF_INK_MUTED);
  doc.setLineWidth(LINE_WEIGHT_DIMENSION_MM);
  drawHeader(doc, columns, xMm, widthMm, topMm);
  let y = topMm + HEADER_HEIGHT_MM;
  for (const item of items) {
    drawRow(doc, columns, item, y);
    y += ROW_HEIGHT_MM;
  }
  doc.line(xMm, y, xMm + widthMm, y);
  return y;
}

function drawEmptyNotice(doc: jsPDF, area: ContentArea): number {
  doc.setTextColor(...PDF_INK_MUTED);
  doc.setFont(FONT_FAMILY, 'italic');
  doc.setFontSize(FONT_SIZE_TABLE_BODY_PT);
  const y = area.yMm + ROW_HEIGHT_MM;
  doc.text(t('bed.export.pdf_empty_bed'), area.xMm, y);
  return y;
}

function rowsPerColumnOf(area: ContentArea): number {
  return Math.max(
    1,
    Math.floor((area.heightMm - HEADER_HEIGHT_MM) / ROW_HEIGHT_MM)
  );
}

export function renderSpeciesTable(
  doc: jsPDF,
  area: ContentArea,
  summary: readonly SpeciesSummaryItem[],
  isEmpty: boolean
): SpeciesTableResult {
  if (isEmpty || summary.length === 0) {
    return {
      endYMm: drawEmptyNotice(doc, area),
      rowsPerColumn: 0,
      overflow: []
    };
  }

  const rowsPerColumn = rowsPerColumnOf(area);
  const useTwoColumns = summary.length > rowsPerColumn;
  const blockCount = useTwoColumns ? 2 : 1;
  const blockWidth =
    (area.widthMm - COLUMN_GAP_MM * (blockCount - 1)) / blockCount;
  const capacity = rowsPerColumn * blockCount;
  const visible = summary.slice(0, capacity);
  const overflow = summary.slice(capacity);

  let endY = area.yMm;
  for (let block = 0; block < blockCount; block += 1) {
    const items = visible.slice(
      block * rowsPerColumn,
      (block + 1) * rowsPerColumn
    );
    if (items.length === 0) break;
    const xMm = area.xMm + block * (blockWidth + COLUMN_GAP_MM);
    endY = Math.max(endY, renderBlock(doc, xMm, blockWidth, area.yMm, items));
  }

  return { endYMm: endY, rowsPerColumn, overflow };
}
