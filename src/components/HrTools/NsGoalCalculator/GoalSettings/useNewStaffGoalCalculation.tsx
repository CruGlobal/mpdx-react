import React, { ReactElement } from 'react';
import { Alert, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  NewStaffGoalCalculationQuery,
  useNewStaffGoalCalculationQuery,
} from './NewStaffGoalCalculation.generated';

export type NewStaffGoalCalculation = NonNullable<
  NewStaffGoalCalculationQuery['newStaffGoalCalculation']
>;

interface UseNewStaffGoalCalculationResult {
  /** The loaded calculation, or `null` while loading / on error / when absent. */
  goalCalculation: NewStaffGoalCalculation | null;
  loading: boolean;
  /** The loading/error/empty element to render while `goalCalculation` is `null`. */
  fallback: ReactElement | null;
}

/**
 * Loads the new staff goal calculation for an account list and centralizes the
 * loading skeleton, error alert, and empty-state.
 */
export const useNewStaffGoalCalculation = (
  accountListId: string,
): UseNewStaffGoalCalculationResult => {
  const { t } = useTranslation();

  const { data, loading, error } = useNewStaffGoalCalculationQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
  });
  const goalCalculation = data?.newStaffGoalCalculation ?? null;

  let fallback: ReactElement | null = null;
  if (loading) {
    fallback = <Skeleton variant="rectangular" height={400} />;
  } else if (error) {
    fallback = <Alert severity="error">{error.message}</Alert>;
  } else if (!goalCalculation) {
    fallback = (
      <Alert severity="info">
        {t('No new staff goal calculation exists for this account.')}
      </Alert>
    );
  }

  return { goalCalculation, loading, fallback };
};
