import React from 'react';
import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import { MedicalPanel } from './MedicalPanel';
import { MileagePanel } from './MileagePanel';
import { SavingsPanel } from './SavingsPanel';
import { UtilitiesPanel } from './UtilitiesPanel';

export const getPrimaryCategoryRightPanel = (
  category: PrimaryBudgetCategoryEnum,
) => {
  switch (category) {
    case PrimaryBudgetCategoryEnum.Saving:
      return <SavingsPanel />;
    case PrimaryBudgetCategoryEnum.Utilities:
      return <UtilitiesPanel />;
    case PrimaryBudgetCategoryEnum.Medical:
      return <MedicalPanel />;
    case PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage:
      return <MileagePanel />;
    default:
      return null;
  }
};
