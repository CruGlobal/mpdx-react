import React from 'react';
import { Box, Stack, SxProps, Theme } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useTranslation } from 'react-i18next';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import {
  QuarterChipData,
  getQuarterLabel,
  healthLabel,
  quarterAmountLabel,
} from '../helpers';
import { ChipCaption, ChipCell, chipGridSx } from './ChipGrid';
import { QuarterChip } from './QuarterChip';

interface FiscalYearQuartersProps {
  quarters: QuarterChipData[];
}
const FiscalYearQuartersBase: React.FC<FiscalYearQuartersProps> = ({
  quarters,
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();

  return (
    // useFlexGap: the label wrappers must not change the chips' spacing
    <Stack
      direction="row"
      spacing={2}
      useFlexGap
      data-testid="quarter-chips"
      sx={chipGridSx}
    >
      {quarters.map(({ fiscalYear, quarter, status, averagePayroll }) => {
        const label = getQuarterLabel(fiscalYear, quarter);
        const amount = quarterAmountLabel({
          t,
          status,
          averagePayroll,
          formatCurrency,
        });

        return (
          <ChipCell key={label}>
            <ChipCaption variant="caption" aria-hidden="true">
              {label}
            </ChipCaption>
            <QuarterChip
              // Health is also conveyed by color, so name it for screen-reader
              // users (WCAG 1.4.1 — not color alone).
              label={
                <>
                  <Box component="span" sx={visuallyHidden as SxProps<Theme>}>
                    {t('{{label}}, {{status}}', {
                      label,
                      status: healthLabel(t, status),
                    })}
                  </Box>
                  {amount}
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
/** The four quarter pay chips, shown in the drawer header. */
export const FiscalYearQuarters = React.memo(FiscalYearQuartersBase);
