import React from 'react';
import { CircularProgress, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useFormatters } from '../../Shared/useFormatters';
import { useGoalSettingsPreview } from './GoalSettingsPreviewContext';

interface MpdGoalPreviewProps {
  /** The saved goal total; shown when there are no goal-affecting edits. */
  savedMonthlyGoal: number;
}

/** Diffs smaller than half a cent are treated as no change. */
const CENT_EPSILON = 0.005;

/**
 * MPD Goal figure in the header. While the form has unsaved, valid edits it
 * shows the recomputed total plus the signed difference from the saved goal
 * (e.g. `+$200.00`), so admins see the impact before saving. The provider does
 * the orchestration; this only renders the result.
 */
export const MpdGoalPreview: React.FC<MpdGoalPreviewProps> = ({
  savedMonthlyGoal,
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();
  const {
    calculating,
    failed,
    previewGoal = null,
  } = useGoalSettingsPreview() ?? {};

  const displayGoal = previewGoal ?? savedMonthlyGoal;
  const diff =
    previewGoal === null
      ? 0
      : Math.round((previewGoal - savedMonthlyGoal) * 100) / 100;
  const changed = Math.abs(diff) >= CENT_EPSILON;

  const diffLabel = (diff > 0 ? '+' : '-') + formatCurrency(Math.abs(diff));

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 3 }}>
      <Typography variant="h6" component="span">
        {t('MPD Goal:')} {!calculating && formatCurrency(displayGoal)}
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
