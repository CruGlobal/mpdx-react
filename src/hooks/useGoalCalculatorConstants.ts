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
      const { plan, size } = constant;
      map.set(`${size}-${plan}`, constant);
    });
    return map;
  }, [data?.constant.mpdGoalBenefitsConstants]);

  const goalMiscConstants = useMemo(() => {
    const miscObject: GoalMiscConstants = {};
    data?.constant.mpdGoalMiscConstants?.forEach((constant) => {
      const { category, label } = constant;
      miscObject[category] ||= {};
      miscObject[category][label] = constant;
    });
    return miscObject;
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
    goalMiscConstants,
    goalGeographicConstantMap,
    error,
    loading: !data,
  };
};
