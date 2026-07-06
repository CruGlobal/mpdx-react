import React from 'react';
import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { PresentationCard } from '../../Shared/GoalPresentation/PresentationCard';
import { StyledHeaderValue } from '../../Shared/SummaryHeaderCard';

export interface GoalSummaryCardProps {
  monthlyGoal: number;
  specialNeedsGoal: number;
  minStaffAccountBalance: number;
}

/**
 * The headline card on the Review Your Calculation step summarizing the three
 * top-level figures.
 */
export const GoalSummaryCard: React.FC<GoalSummaryCardProps> = ({
  monthlyGoal,
  specialNeedsGoal,
  minStaffAccountBalance,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const figures = [
    { label: t('Monthly MPD Goal'), amount: monthlyGoal },
    { label: t('Special Needs Goal'), amount: specialNeedsGoal },
    {
      label: t('Min Staff Account Balance to Report'),
      amount: minStaffAccountBalance,
    },
  ];

  return (
    <PresentationCard title={t('Your MPD Goal Calculation')}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        {figures.map(({ label, amount }) => (
          <Stack key={label} sx={{ flex: 1 }}>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              noWrap
              sx={{ textTransform: 'uppercase' }}
            >
              {label}
            </Typography>
            <StyledHeaderValue
              variant="h3"
              sx={{ fontSize: (theme) => theme.typography.h4.fontSize }}
            >
              {currencyFormat(amount, 'USD', locale, {
                showTrailingZeros: true,
              })}
            </StyledHeaderValue>
          </Stack>
        ))}
      </Stack>
    </PresentationCard>
  );
};
