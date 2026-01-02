import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import { DefaultTypeEnum } from '../../Shared/getDefaultType';

const DirectInputDefaults: Partial<
  Record<PrimaryBudgetCategoryEnum, Record<DefaultTypeEnum, number>>
> = {
  [PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage]: {
    [DefaultTypeEnum.SingleField]: 140,
    [DefaultTypeEnum.SingleOffice]: 70,
    [DefaultTypeEnum.MarriedField]: 140,
    [DefaultTypeEnum.MarriedOffice]: 70,
  },
  [PrimaryBudgetCategoryEnum.MinistryTravel]: {
    [DefaultTypeEnum.SingleField]: 30,
    [DefaultTypeEnum.SingleOffice]: 30,
    [DefaultTypeEnum.MarriedField]: 60,
    [DefaultTypeEnum.MarriedOffice]: 60,
  },
  [PrimaryBudgetCategoryEnum.MeetingsRetreatsConferences]: {
    [DefaultTypeEnum.SingleField]: 100,
    [DefaultTypeEnum.SingleOffice]: 25,
    [DefaultTypeEnum.MarriedField]: 200,
    [DefaultTypeEnum.MarriedOffice]: 50,
  },
  [PrimaryBudgetCategoryEnum.MealsAndPerDiem]: {
    [DefaultTypeEnum.SingleField]: 50,
    [DefaultTypeEnum.SingleOffice]: 25,
    [DefaultTypeEnum.MarriedField]: 100,
    [DefaultTypeEnum.MarriedOffice]: 50,
  },
  [PrimaryBudgetCategoryEnum.MinistryPartnerDevelopment]: {
    [DefaultTypeEnum.SingleField]: 125,
    [DefaultTypeEnum.SingleOffice]: 125,
    [DefaultTypeEnum.MarriedField]: 187.5,
    [DefaultTypeEnum.MarriedOffice]: 187.5,
  },
  [PrimaryBudgetCategoryEnum.SuppliesAndMaterials]: {
    [DefaultTypeEnum.SingleField]: 50,
    [DefaultTypeEnum.SingleOffice]: 50,
    [DefaultTypeEnum.MarriedField]: 75,
    [DefaultTypeEnum.MarriedOffice]: 75,
  },
};

export const getDirectInputDefaults = (
  categoryName: PrimaryBudgetCategoryEnum,
  defaultType: DefaultTypeEnum,
) => {
  const categoryDefaults = DirectInputDefaults[categoryName];

  if (categoryDefaults) {
    return categoryDefaults[defaultType] ?? null;
  }

  return null;
};
