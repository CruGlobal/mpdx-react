import { useMemo } from 'react';
import {
  MpdGoalBenefitsConstantPlanEnum,
  MpdGoalBenefitsConstantSizeEnum,
  MpdGoalMiscConstantEnum,
} from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from './GoalCalculation.generated';

export type GoalBenefitsConstantMap = Map<
  string,
  {
    plan: MpdGoalBenefitsConstantPlanEnum;
    size: MpdGoalBenefitsConstantSizeEnum;
    cost: number;
  }
>;
export type GoalMiscConstantMap = Map<MpdGoalMiscConstantEnum, string>;
export type GoalGeographicConstant = {
  location: string;
  percentageMultiplier: number;
};

interface FormattedConstants {
  goalBenefitsConstantMap: GoalBenefitsConstantMap;
  goalMiscConstantMap: GoalMiscConstantMap;
  goalGeographicConstant: GoalGeographicConstant[];
}

export const useFormatConstants = (
  data?: GoalCalculatorConstantsQuery,
): FormattedConstants => {
  const goalBenefitsConstantMap: GoalBenefitsConstantMap = useMemo(() => {
    const map = new Map();
    data?.constant.mpdGoalBenefitsConstants?.forEach((constant) => {
      const { plan, size, cost } = constant;
      map.set(`${size}-${plan}`, {
        plan,
        size,
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

  const goalGeographicConstant = useMemo(() => {
    return (
      data?.constant.mpdGoalGeographicConstants?.map((constant) => ({
        location: constant.location,
        percentageMultiplier: constant.percentageMultiplier,
      })) || []
    );
  }, [data?.constant.mpdGoalGeographicConstants]);

  return {
    goalBenefitsConstantMap,
    goalMiscConstantMap,
    goalGeographicConstant,
  };
};
