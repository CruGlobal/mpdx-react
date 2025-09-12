import React from 'react';
import {
  PrimaryBudgetCategoryEnum,
  SubBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import { MedicalPanel } from './MedicalPanel';
import { MileagePanel } from './MileagePanel';
import { SavingsPanel } from './SavingsPanel';
import { SubUtilitiesPanel } from './SubUtilitiesPanel';

export const getPrimaryCategoryRightPanel = (
  category: PrimaryBudgetCategoryEnum,
) => {
  switch (category) {
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
    case SubBudgetCategoryEnum.SavingEmergencyFund:
      return <SavingsPanel />;
    default:
      return null;
  }
};
