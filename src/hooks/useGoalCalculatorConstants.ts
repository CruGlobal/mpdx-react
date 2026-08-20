import { useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import {
  MpdGoalMiscConstant,
  MpdGoalMiscConstantCategoryEnum,
  MpdGoalMiscConstantLabelEnum,
} from 'src/graphql/types.generated';
import {
  GoalCalculatorConstantsQuery,
  useGoalCalculatorConstantsQuery,
} from './goalCalculatorConstants.generated';

export type GoalMiscConstants = Partial<
  Record<
    MpdGoalMiscConstantCategoryEnum,
    Partial<
      Record<
        MpdGoalMiscConstantLabelEnum,
        Pick<
          MpdGoalMiscConstant,
          | 'id'
          | 'category'
          | 'categoryDisplayName'
          | 'labelDisplayName'
          | 'label'
          | 'fee'
        >
      >
    >
  >
>;
export type GoalGeographicConstantMap = Map<string, number>;

export interface FormattedConstants {
  goalBenefitsPlans: GoalCalculatorConstantsQuery['constant']['mpdGoalBenefitsConstants'];
  goalMiscConstants: GoalMiscConstants;
  goalGeographicConstantMap: GoalGeographicConstantMap;
}

export const formatConstants = (
  constant: GoalCalculatorConstantsQuery['constant'] | undefined,
): FormattedConstants => {
  const goalMiscConstants: GoalMiscConstants = {};
  constant?.mpdGoalMiscConstants.forEach((constant) => {
    const { category, label } = constant;
    goalMiscConstants[category] ||= {};
    goalMiscConstants[category][label] = constant;
  });

  const goalGeographicConstantMap: GoalGeographicConstantMap = new Map();
  // Ensure the None option always exists
  goalGeographicConstantMap.set('None', 0);
  constant?.mpdGoalGeographicConstants.forEach((constant) => {
    const { location, percentageMultiplier } = constant;
    goalGeographicConstantMap.set(location, percentageMultiplier);
  });

  return {
    goalBenefitsPlans: constant?.mpdGoalBenefitsConstants ?? [],
    goalMiscConstants,
    goalGeographicConstantMap,
  };
};

export interface UseGoalCalculatorConstantsResult extends FormattedConstants {
  loading: boolean;
  error: ApolloError | undefined;
  /**
   * No constants are seeded for the requested year — the query loaded
   * successfully but returned empty constants. Treat this as an error state,
   * not as zero-valued constants: any math or autosave driven by the constants
   * must not run while this is true.
   */
  unavailable: boolean;
}

export interface UseGoalCalculatorConstantsOptions {
  /**
   * Skip fetching the constants, e.g. while the calculations year is still
   * unknown. While skipped, `loading` remains true.
   */
  skip?: boolean;
}

/**
 * Load the MPD goal calculator constants.
 *
 * @param year The year whose constants to load. The constants vary from year
 *   to year, so goals pass their calculations year to keep their math on that
 *   year's values. When omitted or null, the server uses the current year.
 * @param options Options controlling the underlying query.
 */
export const useGoalCalculatorConstants = (
  year?: number | null,
  options?: UseGoalCalculatorConstantsOptions,
): UseGoalCalculatorConstantsResult => {
  const { data, error } = useGoalCalculatorConstantsQuery({
    // Normalize undefined to null so that all callers without a year share one
    // cache entry
    variables: { year: year ?? null },
    fetchPolicy: 'cache-first',
    skip: options?.skip,
  });

  const constants = useMemo(() => formatConstants(data?.constant), [data]);

  return useMemo(
    () => ({
      ...constants,
      error,
      // While the query is skipped or in flight there is no data yet, so both
      // states report as loading
      loading: !data,
      unavailable:
        !!data && data.constant.mpdGoalBenefitsConstants.length === 0,
    }),
    [constants, error, data],
  );
};
