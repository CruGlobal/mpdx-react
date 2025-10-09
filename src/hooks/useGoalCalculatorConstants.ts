import { useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import {
  MpdGoalBenefitsConstant,
  MpdGoalMiscConstant,
  MpdGoalMiscConstantCategoryEnum,
  MpdGoalMiscConstantLabelEnum,
} from 'src/graphql/types.generated';
import {
  GoalCalculatorConstantsQuery,
  useGoalCalculatorConstantsQuery,
} from './goalCalculatorConstants.generated';

export type GoalBenefitsConstantMap = Map<
  string,
  Pick<
    MpdGoalBenefitsConstant,
    'id' | 'size' | 'sizeDisplayName' | 'plan' | 'planDisplayName' | 'cost'
  >
>;
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

interface FormattedConstants {
  goalBenefitsConstantMap: GoalBenefitsConstantMap;
  goalMiscConstants: GoalMiscConstants;
  goalGeographicConstantMap: GoalGeographicConstantMap;
}

export const formatConstants = (
  constant: GoalCalculatorConstantsQuery['constant'] | undefined,
): FormattedConstants => {
  const goalBenefitsConstantMap: GoalBenefitsConstantMap = new Map();
  constant?.mpdGoalBenefitsConstants.forEach((constant) => {
    const { plan, size } = constant;
    goalBenefitsConstantMap.set(`${size}-${plan}`, constant);
  });

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
    goalBenefitsConstantMap,
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
