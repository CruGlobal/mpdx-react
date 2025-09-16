import { useMemo } from 'react';
import {
  MpdGoalBenefitsConstantPlanEnum,
  MpdGoalBenefitsConstantSizeEnum,
  MpdGoalMiscConstantEnum,
} from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from '../components/Reports/GoalCalculator/Shared/GoalCalculation.generated';

export type GoalBenefitsConstantMap = Map<
  string,
  {
    plan: MpdGoalBenefitsConstantPlanEnum;
    planDisplayName: string;
    size: MpdGoalBenefitsConstantSizeEnum;
    sizeDisplayName: string;
    cost: number;
  }
>;
export type GoalMiscConstantMap = Map<MpdGoalMiscConstantEnum, string>;
export type GoalGeographicConstantMap = Map<string, number>;

interface FormattedConstants {
  goalBenefitsConstantMap: GoalBenefitsConstantMap;
  goalMiscConstantMap: GoalMiscConstantMap;
  goalGeographicConstantMap: GoalGeographicConstantMap;
}

export const useFormatConstants = (
  data?: GoalCalculatorConstantsQuery,
): FormattedConstants => {
  const goalBenefitsConstantMap: GoalBenefitsConstantMap = useMemo(() => {
    const map = new Map();
    data?.constant.mpdGoalBenefitsConstants?.forEach((constant) => {
      const { plan, planDisplayName, size, sizeDisplayName, cost } = constant;
      map.set(`${size}-${plan}`, {
        plan,
        planDisplayName,
        size,
        sizeDisplayName,
        cost,
      });
    });
    return map;
  }, [data?.constant.mpdGoalBenefitsConstants]);

  const goalMiscConstantMap = useMemo(() => {
    const map = new Map();
    data?.constant.mpdGoalMiscConstants?.forEach((constant) => {
      const { category, label } = constant;
      map.set(category, label);
    });
    return map;
  }, [data?.constant.mpdGoalMiscConstants]);

  const goalGeographicConstantMap = useMemo(() => {
    const map = new Map();

    data?.constant.mpdGoalGeographicConstants?.forEach((constant) => {
      const { location, percentageMultiplier } = constant;
      map.set(location, percentageMultiplier);
    });
    return map;
  }, [data?.constant.mpdGoalGeographicConstants]);

  return {
    goalBenefitsConstantMap,
    goalMiscConstantMap,
    goalGeographicConstantMap,
  };
};
