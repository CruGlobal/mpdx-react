import React from 'react';
import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PresentationCard } from '../../Shared/GoalPresentation/PresentationCard';
import { StyledHeaderValue } from '../../Shared/SummaryHeaderCard';
import { useFormatters } from '../../Shared/useFormatters';

export interface GoalSummaryCardProps {
  monthlyGoal: number;
  /** Null renders "Coming soon" until special-needs figures are available. */
  specialNeedsGoal: number | null;
  minStaffAccountBalance: number;
  /** Monthly support already raised; null for scenario goals. */
  supportRaised: number | null;
  /** Current staff account balance; null for scenario goals. */
  accountBalance: number | null;
}

interface SummaryFigure {
  label: string;
  amount: number | null;
  /**
   * Optional secondary line rendered beneath the headline amount, already
   * formatted with its value (e.g. "To be Developed: $425.25"). Omitted for
   * scenario goals where the value is unavailable.
   */
  subLabel?: string;
}

/**
 * The headline card on the Review Your Calculation step summarizing the three
 * top-level figures, each with an optional secondary figure beneath it.
 */
export const GoalSummaryCard: React.FC<GoalSummaryCardProps> = ({
  monthlyGoal,
  specialNeedsGoal,
  minStaffAccountBalance,
  supportRaised,
  accountBalance,
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();

  const supportRemaining =
    supportRaised === null ? null : monthlyGoal - supportRaised;

  const figures: SummaryFigure[] = [
    {
      label: t('Monthly MPD Goal'),
      amount: monthlyGoal,
      subLabel:
        supportRemaining === null
          ? undefined
          : t('To be Developed: {{amount}}', {
              amount: formatCurrency(supportRemaining),
            }),
    },
    { label: t('Special Needs Goal'), amount: specialNeedsGoal },
    {
      label: t('Min Staff Account Balance to Report'),
      amount: minStaffAccountBalance,
      subLabel:
        accountBalance === null
          ? undefined
          : t('Current Balance: {{amount}}', {
              amount: formatCurrency(accountBalance),
            }),
    },
  ];

  return (
    <PresentationCard title={t('Your MPD Goal Calculation')}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        {figures.map(({ label, amount, subLabel }) => (
          <Stack key={label} sx={{ flex: 1 }}>
            <Typography
              variant="subtitle2"
              component="p"
              fontWeight="bold"
              sx={{ textTransform: 'uppercase' }}
            >
              {label}
            </Typography>
            <StyledHeaderValue
              component="p"
              sx={{ fontSize: (theme) => theme.typography.h4.fontSize }}
            >
              {amount === null ? t('Coming soon') : formatCurrency(amount)}
            </StyledHeaderValue>
            {subLabel && (
              <Typography
                variant="body1"
                component="p"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {subLabel}
              </Typography>
            )}
          </Stack>
        ))}
      </Stack>
    </PresentationCard>
  );
};
