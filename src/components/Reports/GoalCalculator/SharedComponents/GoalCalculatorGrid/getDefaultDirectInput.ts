import {
  GoalCalculationRole,
  MpdGoalBenefitsConstantSizeEnum,
  PrimaryBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import { GoalMiscConstants } from 'src/hooks/useGoalCalculatorConstants';
import { ListGoalCalculationFragment } from '../../GoalsList/GoalCalculations.generated';
import { getNewStaffBudgetCategory } from '../../Shared/calculateNewStaffTotals';
import { DefaultTypeEnum } from '../../Shared/getDefaultType';

const createGoalCalculationFromDefault = (
  defaultType: DefaultTypeEnum,
): Partial<ListGoalCalculationFragment> => {
  switch (defaultType) {
    case DefaultTypeEnum.SingleField:
      return {
        role: GoalCalculationRole.Field,
        familySize: null,
      };
    case DefaultTypeEnum.SingleOffice:
      return {
        role: GoalCalculationRole.Office,
        familySize: null,
      };
    case DefaultTypeEnum.MarriedField:
      return {
        role: GoalCalculationRole.Field,
        familySize: MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren,
      };
    case DefaultTypeEnum.MarriedOffice:
      return {
        role: GoalCalculationRole.Office,
        familySize: MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren,
      };
  }
};

export const getDirectInputDefaults = (
  categoryName: PrimaryBudgetCategoryEnum,
  defaultType: DefaultTypeEnum,
  miscConstants: GoalMiscConstants,
): number => {
  const goalCalculationDefaults = createGoalCalculationFromDefault(defaultType);

  return getNewStaffBudgetCategory(
    goalCalculationDefaults as ListGoalCalculationFragment,
    categoryName,
    miscConstants,
  );
};
