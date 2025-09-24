import { useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import {
  MpdGoalBenefitsConstant,
  MpdGoalMiscConstant,
  MpdGoalMiscConstantCategoryEnum,
  MpdGoalMiscConstantLabelEnum,
} from 'src/graphql/types.generated';
import { useGoalCalculatorConstantsQuery } from './goalCalculatorConstants.generated';

export type GoalBenefitsConstantMap = Map<
  string,
  Pick<
    MpdGoalBenefitsConstant,
    'id' | 'size' | 'sizeDisplayName' | 'plan' | 'planDisplayName' | 'cost'
  >
>;
export type GoalMiscConstants = Record<
  MpdGoalMiscConstantCategoryEnum,
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
>;
export type GoalGeographicConstantMap = Map<string, number>;

interface FormattedConstants {
  goalBenefitsConstantMap: GoalBenefitsConstantMap;
  GoalMiscConstants: GoalMiscConstants;
  goalGeographicConstantMap: GoalGeographicConstantMap;
  loading: boolean;
  error: ApolloError | undefined;
}

export const useGoalCalculatorConstants = (): FormattedConstants => {
  const { data, error } = useGoalCalculatorConstantsQuery({
    fetchPolicy: 'cache-first',
  });

  const goalBenefitsConstantMap = useMemo(() => {
    const map: GoalBenefitsConstantMap = new Map();
    data?.constant.mpdGoalBenefitsConstants?.forEach((constant) => {
      const { plan, size, ...props } = constant;
      map.set(`${size}-${plan}`, {
        ...props,
        plan,
        size,
      });
    });
    return map;
  }, [data?.constant.mpdGoalBenefitsConstants]);

  const GoalMiscConstants = useMemo(() => {
    const miscObject: Record<string, Record<string, any>> = {};
    data?.constant.mpdGoalMiscConstants?.forEach((constant) => {
      const { category, label } = constant;
      if (!miscObject[category]) {
        miscObject[category] = {
          [label]: constant,
        };
      } else {
        miscObject[category] = { ...miscObject[category], [label]: constant };
      }
    });
    return miscObject as GoalMiscConstants;
  }, [data?.constant.mpdGoalMiscConstants]);

  const goalGeographicConstantMap = useMemo(() => {
    const map: GoalGeographicConstantMap = new Map();

    data?.constant.mpdGoalGeographicConstants?.forEach((constant) => {
      const { location, percentageMultiplier } = constant;
      map.set(location, percentageMultiplier ?? 0);
    });
    return map;
  }, [data?.constant.mpdGoalGeographicConstants]);

  return {
    goalBenefitsConstantMap,
    GoalMiscConstants,
    goalGeographicConstantMap,
    error,
    loading: !data,
  };
};
