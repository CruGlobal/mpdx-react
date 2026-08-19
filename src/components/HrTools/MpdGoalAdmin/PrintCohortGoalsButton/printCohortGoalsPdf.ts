import { currencyFormat } from 'src/lib/intlFormat';
import { Cohort } from '../mpdGoalAdminHelpers';

// Escape the characters that terminate or escape a PDF literal string.
const escapePdfText = (text: string): string =>
  text.replace(/[\\()]/g, (char) => `\\${char}`);

/**
 * Builds a minimal single-page PDF document listing one line of text per
 * entry in `lines`. Exported for tests; use `generateCohortGoalsPdf` instead.
 *
 * This is placeholder output for the mock MpdGoalAdmin tool only — the real
 * worksheet PDF is rendered server-side (MPDX-9690) and this entire builder
 * goes away when the printCohortGoals mutation ships (MPDX-9691).
 */
export const buildPlaceholderPdf = (lines: string[]): string => {
  // y = 720 - index * 18 falls below the 792pt MediaBox around line 40; fail
  // loud rather than silently truncate a printed goals document.
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
  // The xref table needs the byte offset of every object, so measure the
  // document as it grows. Byte lengths, not string lengths — names in the
  // content stream can be multi-byte.
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

// The en-US pin is deliberate: it matches the server worksheet's :en/USD pin
// (MPDX-9690) and keeps the PDF literal string ASCII-safe.
const formatUsd = (amount: number): string =>
  currencyFormat(amount, 'USD', 'en-US');

/**
 * Generates the printable PDF of every goal in the cohort and resolves with a
 * URL the browser can download it from.
 *
 * TODO(MPDX-9691): replace this mock with the printCohortGoals mutation. The
 * server (MPDX-9690) renders the real Support Goals Worksheet — one page per
 * goal — and the mutation exposes a download URL for the concatenated
 * document; this function should then reduce to mutate → return that URL.
 * Constraints for that implementation:
 * - The resolved URL must be same-origin or a blob URL — `anchor.download` in
 *   `downloadPdf` is ignored for cross-origin URLs, so a signed S3/API URL
 *   means mutate → fetch → createObjectURL (as in `exportRest.tsx`), not a
 *   bare redirect.
 * - `downloadPdf`'s `URL.revokeObjectURL(url)` is blob-era cleanup and a
 *   harmless no-op on non-blob URLs.
 * - Scope: Print All prints the whole cohort, so the mutation contract only
 *   needs `cohortId`.
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
 * Triggers a browser download of `url` via a temporary anchor (the same
 * mechanism as the contacts CSV export in
 * `src/components/Contacts/MassActions/Exports/exportRest.tsx`), then
 * releases the URL (a no-op when `url` is not a blob URL).
 */
export const downloadPdf = (url: string, filename: string): void => {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
  anchor.remove();
};
