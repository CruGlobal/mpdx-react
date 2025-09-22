import { useMemo } from 'react';
import { ApolloError } from '@apollo/client';
import {
  MpdGoalBenefitsConstant,
  MpdGoalMiscConstant,
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
export type GoalMiscConstantMap = Map<
  MpdGoalMiscConstantLabelEnum,
  Pick<
    MpdGoalMiscConstant,
    'id' | 'category' | 'categoryDisplayName' | 'labelDisplayName' | 'fee'
  >
>;
export type GoalGeographicConstantMap = Map<string, number>;

interface FormattedConstants {
  goalBenefitsConstantMap: GoalBenefitsConstantMap;
  goalMiscConstantMap: GoalMiscConstantMap;
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

  const goalMiscConstantMap = useMemo(() => {
    const map: GoalMiscConstantMap = new Map();
    data?.constant.mpdGoalMiscConstants?.forEach((constant) => {
      const { label, ...props } = constant;
      map.set(label, props);
    });
    return map;
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
    goalMiscConstantMap,
    goalGeographicConstantMap,
    error,
    loading: !data,
  };
};
