import { TFunction } from 'i18next';
import { StaffReportRow, StaffReportRowPending } from './staffReportRow';

/**
 * How a row reads when some of it is dated after today, or null when none of it is. A rolled up
 * row that is only partly pending counts its pending transactions, since the total mixes both.
 */
export const getPendingLabel = (
  pending: StaffReportRowPending | null,
  t: TFunction,
): string | null => {
  if (!pending) {
    return null;
  }

  return pending.count === pending.total
    ? t('Pending')
    : t('{{pending}} of {{total}} Pending', {
        pending: pending.count,
        total: pending.total,
      });
};

/** The description with its pending label in parentheses, for outputs that only have plain text. */
export const getDescriptionWithPending = (
  row: Pick<StaffReportRow, 'description' | 'pending'>,
  t: TFunction,
): string => {
  const pendingLabel = getPendingLabel(row.pending, t);
  return pendingLabel
    ? `${row.description} (${pendingLabel})`
    : row.description;
};
