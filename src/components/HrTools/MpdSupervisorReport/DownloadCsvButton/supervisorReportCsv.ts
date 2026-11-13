import { TFunction } from 'i18next';
import { capHealthLabel } from '../Filters/mpdSupervisorReportFilters';
import { balanceMonthLabel } from '../balanceHelpers';
import {
  StaffRow,
  floorToTenth,
  getRowName,
  getRowTeamNames,
} from '../helpers';

// Half dollars round away from zero, as the screen's currency format does
const wholeDollars = (amount: number) =>
  Math.sign(amount) * Math.round(Math.abs(amount)) || 0;

export type SupervisorReportCsv = (string | number)[][];

// react-csv wraps each cell in quotes but leaves quotes inside it alone, so a
// name with a quote would split its cell and shift the columns after it
const escapeQuotes = (cell: string | number) =>
  typeof cell === 'string' ? cell.replace(/"/g, '""') : cell;

/**
 * The report's rows as CSV cells, a header row first. Numbers stay plain
 * (no $ or %) so a spreadsheet can sort and sum them; blank means no value.
 */
export const buildSupervisorReportCsv = (
  rows: StaffRow[],
  t: TFunction,
  locale: string,
): SupervisorReportCsv => {
  // Every row covers the same months, newest first
  const months = rows[0]?.monthEndBalances ?? [];
  const header = [
    t('Name'),
    t('Staff Account ID'),
    t('Team'),
    t('Health'),
    t('% of Personal CAP (last month)'),
    ...months.map(({ month }) =>
      t('{{month}} ending balance', {
        month: balanceMonthLabel(month, locale),
      }),
    ),
  ];

  const body = rows.map((row) => [
    getRowName(row),
    row.staffAccountId,
    getRowTeamNames(row).join(', '),
    row.capHealth ? capHealthLabel(t, row.capHealth) : '',
    typeof row.percentOfCap === 'number' ? floorToTenth(row.percentOfCap) : '',
    ...row.monthEndBalances.map(({ endBalance }) =>
      typeof endBalance === 'number' ? wholeDollars(endBalance) : '',
    ),
  ]);

  return [header, ...body].map((row) => row.map(escapeQuotes));
};
