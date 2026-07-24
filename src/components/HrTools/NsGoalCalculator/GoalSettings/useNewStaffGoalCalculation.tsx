import React, { ReactElement } from 'react';
import { ApolloError } from '@apollo/client';
import { Alert, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NewStaffGoalCalculationAttributesInput } from 'src/graphql/types.generated';
import {
  NewStaffGoalCalculationQuery,
  useNewStaffGoalCalculationQuery,
  useUpdateNewStaffGoalCalculationMutation,
} from './NewStaffGoalCalculation.generated';

export type NewStaffGoalCalculation = NonNullable<
  NewStaffGoalCalculationQuery['newStaffGoalCalculation']
>;

/**
 * Where the goal comes from: a real goal scoped by an account list, or one of
 * the current user's scenario goals fetched by id (no account list).
 */
export type GoalSettingsSource =
  | { accountListId: string }
  | { scenarioGoalId: string };

interface UseNewStaffGoalCalculationResult {
  /** The loaded calculation, or `null` while loading / on error / when absent. */
  goalCalculation: NewStaffGoalCalculation | null;
  loading: boolean;
  error?: ApolloError;
  /** The loading/error/empty element to render while `goalCalculation` is `null`. */
  fallback: ReactElement | null;
  /** True when the source is a scenario goal (fetched/saved by id). */
  isScenario: boolean;
  /** The account list the goal belongs to, or `null` for a scenario goal. */
  accountListId: string | null;
  /**
   * Save edits to the goal. Real goals save by account list + id; scenario goals
   * by id alone. Both go through the updateNewStaffGoalCalculation mutation.
   */
  save: (
    attributes: NewStaffGoalCalculationAttributesInput,
  ) => Promise<unknown>;
}

/**
 * Loads and saves a New Staff goal calculation, hiding the difference between a
 * real goal (scoped by account list) and a scenario goal (admin-built, no
 * account list, fetched by id). Both modes go through the same
 * newStaffGoalCalculation query and updateNewStaffGoalCalculation mutation.
 */
export const useNewStaffGoalCalculation = (
  source: GoalSettingsSource,
): UseNewStaffGoalCalculationResult => {
  const { t } = useTranslation();

  const isScenario = 'scenarioGoalId' in source;

  // A real goal is fetched by its account list; a scenario goal by id, with the
  // account list omitted.
  const { data, loading, error } = useNewStaffGoalCalculationQuery({
    variables: isScenario
      ? { accountListId: null, id: source.scenarioGoalId }
      : { accountListId: source.accountListId, id: null },
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

  const [updateGoalCalculation] = useUpdateNewStaffGoalCalculationMutation();

  return {
    goalCalculation,
    loading,
    error,
    fallback,
    isScenario,
    accountListId: isScenario ? null : source.accountListId,
    save: async (attributes) => {
      if (!goalCalculation) {
        return;
      }
      return updateGoalCalculation({
        variables: {
          input: isScenario
            ? { id: source.scenarioGoalId, attributes }
            : {
                accountListId: source.accountListId,
                id: goalCalculation.id,
                attributes,
              },
        },
      });
    },
  };
};
