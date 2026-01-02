import { GoalCalculationRole } from 'src/graphql/types.generated';

export const enum DefaultTypeEnum {
  SingleField = 'SingleField',
  SingleOffice = 'SingleOffice',
  MarriedField = 'MarriedField',
  MarriedOffice = 'MarriedOffice',
}

export const getDefaultType = (
  role: GoalCalculationRole | null,
  isMarried: boolean,
): DefaultTypeEnum => {
  if (role === GoalCalculationRole.Field) {
    return isMarried
      ? DefaultTypeEnum.MarriedField
      : DefaultTypeEnum.SingleField;
  }
  if (role === GoalCalculationRole.Office) {
    return isMarried
      ? DefaultTypeEnum.MarriedOffice
      : DefaultTypeEnum.SingleOffice;
  }

  return DefaultTypeEnum.SingleField;
};
