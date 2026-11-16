import { buildURI } from 'react-csv/lib/core';

export type CsvCell = string | number | null | undefined;

// A spreadsheet can run a cell that starts with one of these as a formula
const formulaStart = /^[=+\-@\t\r]/;

/**
 * react-csv wraps each cell in quotes but leaves quotes inside it alone, so a
 * quote would split its cell and shift the columns after it. Text that starts
 * like a formula gets a ' in front so it opens as text. Numbers stay numbers.
 */
export const escapeCsvCell = (cell: CsvCell): CsvCell => {
  if (typeof cell !== 'string') {
    return cell;
  }
  const escaped = cell.replace(/"/g, '""');
  return formulaStart.test(escaped) ? `'${escaped}` : escaped;
};

/** A download URL for the rows as a CSV file, every cell escaped first. */
export const buildCsvUri = (rows: CsvCell[][]): string =>
  buildURI(
    rows.map((row) => row.map(escapeCsvCell)),
    true,
  );
