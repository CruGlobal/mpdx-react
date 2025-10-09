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

interface UseGoalCalculatorConstantsResult extends FormattedConstants {
  loading: boolean;
  error: ApolloError | undefined;
}

export const useGoalCalculatorConstants =
  (): UseGoalCalculatorConstantsResult => {
    const { data, error } = useGoalCalculatorConstantsQuery({
      fetchPolicy: 'cache-first',
    });

    const constants = useMemo(() => formatConstants(data?.constant), [data]);

    return {
      ...constants,
      error,
      loading: !data,
    };
  };
