import { buildURI } from 'react-csv/lib/core';

export type CsvCell = string | number | null | undefined;

// A spreadsheet can run a cell that starts with one of these as a formula
const formulaStart = /^[=+\-@\t\r]/;

// Text that is only a signed amount, like -$50.00 or -1 234,56 €, or a lone
// dash cannot run, and should stay a number in the spreadsheet
const plainAmount = /^[+-]?(\p{Sc}?\s?\d[\d.,\s]*[\p{Sc}%]?)?$/u;

/**
 * react-csv wraps each cell in quotes but leaves quotes inside it alone, so a
 * quote would split its cell and shift the columns after it. Text that starts
 * like a formula gets a ' in front so it opens as text. Numbers, and text that
 * is only an amount, stay numbers.
 */
export const escapeCsvCell = (cell: CsvCell): CsvCell => {
  if (typeof cell !== 'string') {
    return cell;
  }
  const escaped = cell.replace(/"/g, '""');
  const runsAsFormula =
    formulaStart.test(escaped) && !plainAmount.test(escaped);
  return runsAsFormula ? `'${escaped}` : escaped;
};

/** A download URL for the rows as a CSV file, every cell escaped first. */
export const buildCsvUri = (rows: CsvCell[][]): string =>
  buildURI(
    rows.map((row) => row.map(escapeCsvCell)),
    true,
  );
