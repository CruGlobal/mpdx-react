import React, { useId } from 'react';
import {
  Alert,
  Box,
  Divider,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MpdHealthStatusEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { QuarterChip } from '../StaffMemberRow/QuarterChip';
import {
  balanceAmountLabel,
  balanceStatusLabel,
  formatWholeDollars,
  householdTypeLabel,
} from '../balanceHelpers';
import { useMpdBalanceBuffersQuery } from './MpdBalanceBuffers.generated';
import { healthStatusOrder } from './legendCopy';

// Illustrative balances for the sample chips, one per status
const sampleBalances: Record<MpdHealthStatusEnum, number | null> = {
  [MpdHealthStatusEnum.Green]: 12000,
  [MpdHealthStatusEnum.Yellow]: 6500,
  [MpdHealthStatusEnum.Red]: -850,
  [MpdHealthStatusEnum.Blue]: 1200,
  [MpdHealthStatusEnum.Gray]: null,
};

/** The buffer for each household type, from the API. */
const BufferTable: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { data, error } = useMpdBalanceBuffersQuery();

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 1 }}>
        {t('Could not load the recommended buffers.')}
      </Alert>
    );
  }
  if (!data) {
    return (
      <Skeleton
        data-testid="buffers-loading"
        variant="rounded"
        width={160}
        height={96}
        sx={{ my: 1 }}
      />
    );
  }
  return (
    <Table size="small" sx={{ my: 1, width: 'auto' }}>
      <TableBody>
        {data.mpdBalanceBuffers.map(({ householdType, amount }) => (
          <TableRow key={householdType}>
            <TableCell sx={{ fontWeight: 'bold', pl: 0 }}>
              {householdTypeLabel(t, householdType)}
            </TableCell>
            <TableCell>{formatWholeDollars(amount, locale)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

/** The legend's explanation of the row's month-end balance chips and buffers. */
export const BalanceColorsSection: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const headingId = useId();

  const explanations: Record<MpdHealthStatusEnum, string> = {
    [MpdHealthStatusEnum.Green]: t(
      "The balance was at or above the household's recommended buffer.",
    ),
    [MpdHealthStatusEnum.Yellow]: t(
      "The balance was $0 or more, but below the household's buffer.",
    ),
    [MpdHealthStatusEnum.Red]: t('The balance was below zero.'),
    [MpdHealthStatusEnum.Blue]: t(
      'No one on the staff account is a supported employee, so it has no buffer. This includes department-funded staff, Staff Emeritus and volunteers. Anyone who shares a staff account with a supported employee is graded with them.',
    ),
    [MpdHealthStatusEnum.Gray]: t(
      'No balance has synced for that month (shown as a dash), or the month is before their first payroll (the amount still shows).',
    ),
  };

  return (
    <Box component="section" aria-labelledby={headingId}>
      <Divider sx={{ my: 2 }} />
      <Typography
        id={headingId}
        variant="subtitle1"
        component="h3"
        fontWeight={600}
        mb={1}
      >
        {t('Colors')}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {t(
          'Each row shows the staff account balance at the end of the last four complete months, newest first. The report lists the lowest balance at the end of last month first. Staff with No data for last month are listed last.',
        )}
      </Typography>
      {healthStatusOrder.map((status) => (
        <Box
          key={status}
          sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}
        >
          <QuarterChip
            aria-hidden
            health={status}
            size="small"
            label={balanceAmountLabel(sampleBalances[status], locale)}
            sx={{ flexShrink: 0 }}
          />
          <Typography variant="body2">
            <Box component="strong">{balanceStatusLabel(t, status)}</Box>
            {': '}
            {explanations[status]}
          </Typography>
        </Box>
      ))}
      <Typography variant="subtitle2" component="h4" sx={{ mt: 2 }}>
        {t('Recommended buffers')}
      </Typography>
      <BufferTable />
      <Typography variant="body2" color="text.secondary">
        {t(
          'Family is married with children. Couple is married without children, or a single parent. Single includes staff whose spouse is not on staff (SOSA). Marriage and children come from HR records.',
        )}
      </Typography>
    </Box>
  );
};
