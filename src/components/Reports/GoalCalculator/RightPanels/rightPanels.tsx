import React from 'react';
import {
  PrimaryBudgetCategoryEnum,
  SubBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import { MedicalPanel } from './MedicalPanel';
import { MileagePanel } from './MileagePanel';
import { SavingsPanel } from './SavingsPanel';
import { SubUtilitiesPanel } from './SubUtilitiesPanel';
// import { UtilitiesPanel } from './UtilitiesPanel';

export const getPrimaryCategoryRightPanel = (
  category: PrimaryBudgetCategoryEnum,
) => {
  switch (category) {
    case PrimaryBudgetCategoryEnum.Saving:
      return <SavingsPanel />;
    case PrimaryBudgetCategoryEnum.Medical:
      return <MedicalPanel />;
    case PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage:
      return <MileagePanel />;
    default:
      return null;
  }
};

export const getSubCategoryRightPanel = (
  subCategory: SubBudgetCategoryEnum,
) => {
  switch (subCategory) {
    case SubBudgetCategoryEnum.UtilitiesInternet:
    case SubBudgetCategoryEnum.UtilitiesPhoneMobile:
      return <SubUtilitiesPanel />;
    default:
      return null;
  }
};
