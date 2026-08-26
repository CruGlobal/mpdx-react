import { currencyFormat } from 'src/lib/intlFormat';
import { Cohort, StaffGoalRow } from '../mpdGoalAdminHelpers';

const escapePdfText = (text: string): string =>
  text.replace(/[\\()]/g, (char) => `\\${char}`);

// Text runs off the 792pt page past ~line 40, so start a new page before that.
const maxLinesPerPage = 38;

/**
 * Builds a minimal PDF listing one line of text per entry, paginating every
 * 38 lines. Placeholder for the mock tool only: the real worksheet is rendered
 * server-side (MPDX-9690) and this builder goes away with MPDX-9691.
 */
export const buildPlaceholderPdf = (lines: string[]): string => {
  const pages: string[][] = [];
  for (let start = 0; start < lines.length; start += maxLinesPerPage) {
    pages.push(lines.slice(start, start + maxLinesPerPage));
  }
  if (!pages.length) {
    pages.push([]);
  }
  const encoder = new TextEncoder();
  // Object numbers: 1 catalog, 2 pages, 3 font, then a page/content pair each.
  const pageObjectNumber = (pageIndex: number) => 4 + pageIndex * 2;
  const kids = pages
    .map((_, pageIndex) => `${pageObjectNumber(pageIndex)} 0 R`)
    .join(' ');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    ...pages.flatMap((pageLines, pageIndex) => {
      const content = pageLines
        .map(
          (line, index) =>
            `BT /F1 12 Tf 72 ${720 - index * 18} Td (${escapePdfText(line)}) Tj ET`,
        )
        .join('\n');
      return [
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${pageObjectNumber(pageIndex) + 1} 0 R >>`,
        `<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`,
      ];
    }),
  ];

  let pdf = '%PDF-1.4\n';
  // xref needs each object's byte offset — byte length, not string length.
  const offsets: number[] = [];
  objects.forEach((object, index) => {
    offsets.push(encoder.encode(pdf).length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = encoder.encode(pdf).length;
  pdf +=
    `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` +
    offsets
      .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
      .join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
};

// Pinned to en-US to match the server worksheet (MPDX-9690) and stay ASCII-safe.
const formatUsd = (amount: number): string =>
  currencyFormat(amount, 'USD', 'en-US');

/**
 * Generates the cohort's printable PDF and resolves with a download URL.
 *
 * `rows` are the attendees to list. Attendees are a separate, server-filtered
 * query now, so the caller can only hand over the rows currently matching the
 * search — meaning this placeholder prints the visible rows rather than the
 * whole cohort while a search is active.
 *
 * TODO(MPDX-9691): replace with the printCohortGoals mutation, which needs only
 * `cohortId` (this prints the whole cohort, restoring the ignores-search
 * behavior). The URL it returns must be same-origin or a blob URL —
 * `anchor.download` is ignored cross-origin, so a signed S3 URL means
 * mutate → fetch → createObjectURL, as `exportRest.tsx` does.
 */
export const generateCohortGoalsPdf = async (
  cohort: Cohort,
  rows: StaffGoalRow[],
): Promise<string> => {
  const pdf = buildPlaceholderPdf([
    `MPD Goals - ${cohort.name}`,
    '',
    // Pending, not $0: a null goal has no calculation yet (ASCII, so no em-dash).
    ...rows.map(
      (row) =>
        `${row.name}: ${row.mpdGoal === null ? 'Pending' : formatUsd(row.mpdGoal)}`,
    ),
  ]);
  return URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
};

/**
 * Downloads `url` via a temporary anchor, as the contacts CSV export does.
 */
export const downloadPdf = (url: string, filename: string): void => {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
  anchor.remove();
};
