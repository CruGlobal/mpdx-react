import { currencyFormat } from 'src/lib/intlFormat';
import { Cohort } from '../mpdGoalAdminHelpers';

const escapePdfText = (text: string): string =>
  text.replace(/[\\()]/g, (char) => `\\${char}`);

/**
 * Builds a minimal single-page PDF listing one line of text per entry.
 * Placeholder for the mock tool only: the real worksheet is rendered
 * server-side (MPDX-9690) and this builder goes away with MPDX-9691.
 */
export const buildPlaceholderPdf = (lines: string[]): string => {
  // Text runs off the 792pt page past ~line 40; fail loud, never truncate.
  if (lines.length > 38) {
    throw new Error('Placeholder PDF supports at most 38 lines per page');
  }
  const encoder = new TextEncoder();
  const content = lines
    .map(
      (line, index) =>
        `BT /F1 12 Tf 72 ${720 - index * 18} Td (${escapePdfText(line)}) Tj ET`,
    )
    .join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
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
 * TODO(MPDX-9691): replace with the printCohortGoals mutation, which needs only
 * `cohortId` (this prints the whole cohort). The URL it returns must be
 * same-origin or a blob URL — `anchor.download` is ignored cross-origin, so a
 * signed S3 URL means mutate → fetch → createObjectURL, as `exportRest.tsx` does.
 */
export const generateCohortGoalsPdf = async (
  cohort: Cohort,
): Promise<string> => {
  const pdf = buildPlaceholderPdf([
    `MPD Goals - ${cohort.name}`,
    '',
    ...cohort.rows.map((row) => `${row.name}: ${formatUsd(row.mpdGoal)}`),
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
