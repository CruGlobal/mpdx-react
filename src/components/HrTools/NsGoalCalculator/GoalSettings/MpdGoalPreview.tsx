import React from 'react';
import { CircularProgress, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useMpdGoalPreview } from './useMpdGoalPreview';

interface MpdGoalPreviewProps {
  /**
   * Account list the goal belongs to, or `null` for a scenario goal that has no
   * account list.
   */
  accountListId: string | null;
  calculationId: string;
  /** The saved goal total; shown when there are no goal-affecting edits. */
  savedMonthlyGoal: number;
}

/**
 * MPD Goal figure in the header. When a field is blurred with unsaved, valid
 * edits it shows the recomputed goal total plus the signed difference from the
 * saved goal (e.g. `+$200.00` / `-$75.00`) so coaches and admins can see the
 * impact of a change before saving. All the preview orchestration lives in
 * {@link useMpdGoalPreview}; this component only renders its result.
 */
export const MpdGoalPreview: React.FC<MpdGoalPreviewProps> = ({
  accountListId,
  calculationId,
  savedMonthlyGoal,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { containerRef, calculating, displayGoal, diff, changed, failed } =
    useMpdGoalPreview({ accountListId, calculationId, savedMonthlyGoal });

  const diffLabel =
    (diff > 0 ? '+' : '-') +
    currencyFormat(Math.abs(diff), 'USD', locale, {
      showTrailingZeros: true,
    });

  return (
    <Stack
      ref={containerRef}
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ ml: 3 }}
    >
      <Typography
        variant="h6"
        component="span"
        sx={{ minWidth: (theme) => theme.spacing(20) }}
      >
        {t('MPD Goal:')}{' '}
        {!calculating &&
          currencyFormat(displayGoal, 'USD', locale, {
            showTrailingZeros: true,
          })}
      </Typography>
      {calculating && (
        <CircularProgress
          size={16}
          aria-label={t('Calculating new goal total')}
        />
      )}
      {!calculating && changed && (
        <Typography
          variant="h6"
          component="span"
          sx={{ color: 'text.secondary' }}
          aria-label={t('Unsaved changes will adjust goal by {{diff}}', {
            diff: diffLabel,
          })}
        >
          {diffLabel}
        </Typography>
      )}
      {!calculating && failed && (
        <Typography
          variant="body2"
          component="span"
          sx={{ color: 'text.secondary' }}
        >
          {t('Preview unavailable')}
        </Typography>
      )}
    </Stack>
  );
};
