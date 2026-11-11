import React from 'react';
import { Box, Stack, SxProps, Theme } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import {
  balanceAmountLabel,
  balanceMonthLabel,
  balanceStatusLabel,
} from '../balanceHelpers';
import { ManagedStaffMember } from '../helpers';
import { ChipCaption, ChipCell, chipGridSx } from './ChipGrid';
import { QuarterChip } from './QuarterChip';

interface MonthEndBalancesProps {
  balances: ManagedStaffMember['monthEndBalances'];
}

const MonthEndBalancesBase: React.FC<MonthEndBalancesProps> = ({
  balances,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <Stack
      direction="row"
      spacing={2}
      useFlexGap
      data-testid="balance-chips"
      sx={chipGridSx}
    >
      {balances.map(({ month, endBalance, status }) => {
        const label = balanceMonthLabel(month, locale);
        return (
          <ChipCell key={month}>
            <ChipCaption variant="caption" aria-hidden="true">
              {label}
            </ChipCaption>
            <QuarterChip
              // Color alone must not carry the status (WCAG 1.4.1)
              label={
                <>
                  <Box component="span" sx={visuallyHidden as SxProps<Theme>}>
                    {t('{{label}}, {{status}}', {
                      label,
                      status: balanceStatusLabel(t, status),
                    })}
                  </Box>
                  {balanceAmountLabel(endBalance, locale)}
                </>
              }
              health={status}
              size="small"
            />
          </ChipCell>
        );
      })}
    </Stack>
  );
};

/** The row's last four month-end balances, newest first, colored against the household's buffer. */
export const MonthEndBalances = React.memo(MonthEndBalancesBase);
