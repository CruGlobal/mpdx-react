import { TFunction, useTranslation } from 'react-i18next';
import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';

type Category = StaffExpenseCategoryEnum | StaffExpensesSubCategoryEnum;

export const getLocalizedCategory = (category: Category, t: TFunction) => {
  const humanReadableCategories: Record<
    StaffExpenseCategoryEnum | StaffExpensesSubCategoryEnum,
    string
  > = {
    [StaffExpenseCategoryEnum.Assessment]: t('Assessment'),
    [StaffExpenseCategoryEnum.Benefits]: t('Benefits'),
    [StaffExpenseCategoryEnum.Donation]: t('Donation'),
    [StaffExpenseCategoryEnum.HealthcareReimbursement]: t(
      'Healthcare Reimbursement',
    ),
    [StaffExpenseCategoryEnum.MinistryReimbursement]: t(
      'Ministry Reimbursement',
    ),
    [StaffExpenseCategoryEnum.Salary]: t('Salary'),
    [StaffExpenseCategoryEnum.Transfer]: t('Transfer'),
    [StaffExpenseCategoryEnum.AdditionalSalary]: t('Additional Salary'),
    [StaffExpenseCategoryEnum.Other]: t('Other'),
    [StaffExpensesSubCategoryEnum.BenefitsOther]: t('Benefits Other'),
    [StaffExpensesSubCategoryEnum.CreditCardFee]: t('Credit Card Fee'),
    [StaffExpensesSubCategoryEnum.Deduction_403BPretax]:
      'Deduction 403b Pretax',
    [StaffExpensesSubCategoryEnum.Deduction_403BRoth]: t('Deduction 403b Roth'),
    [StaffExpensesSubCategoryEnum.DeductionMedical]: t('Deduction Medical'),
    [StaffExpensesSubCategoryEnum.Deposit]: t('Deposit'),
    [StaffExpensesSubCategoryEnum.EarningsMha]: t('Earnings MHA'),
    [StaffExpensesSubCategoryEnum.EarningsNumeric]: t('Earnings Numeric'),
    [StaffExpensesSubCategoryEnum.EarningsReb]: t('Earnings REB'),
    [StaffExpensesSubCategoryEnum.MedicalDeduction]: t('Medical Deduction'),
    [StaffExpensesSubCategoryEnum.NonCash]: t('Non Cash'),
    [StaffExpensesSubCategoryEnum.NumericDeduction]: t('Numeric Deduction'),
    [StaffExpensesSubCategoryEnum.OtherAssessment]: t('Other Assessment'),
    [StaffExpensesSubCategoryEnum.ProgramBased]: t('Program Based'),
    [StaffExpensesSubCategoryEnum.SalaryOther]: t('Salary Other'),
    [StaffExpensesSubCategoryEnum.StaffAssessment]: t('Staff Assessment'),
    [StaffExpensesSubCategoryEnum.TaxFederal]: t('Tax Federal'),
    [StaffExpensesSubCategoryEnum.TaxState]: t('Tax State'),
    [StaffExpensesSubCategoryEnum.Withdrawal]: t('Withdrawal'),
  };

  return humanReadableCategories[category] ?? t('Unknown Category');
};

export const useLocalizedCategory = (category: Category) => {
  const { t } = useTranslation();
  return getLocalizedCategory(category, t);
};
