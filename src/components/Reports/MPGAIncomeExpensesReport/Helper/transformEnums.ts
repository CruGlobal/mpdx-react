import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';

export const transformCategory = (value: StaffExpenseCategoryEnum) => {
  return categoryLabels[value];
};

export const transformSubcategory = (value: StaffExpensesSubCategoryEnum) => {
  return subcategoryLabels[value];
};

export const categoryLabels: Record<StaffExpenseCategoryEnum, string> = {
  [StaffExpenseCategoryEnum.Donation]: 'Donation',
  [StaffExpenseCategoryEnum.Transfer]: 'Transfer',
  [StaffExpenseCategoryEnum.MinistryReimbursement]: 'Ministry Reimbursement',
  [StaffExpenseCategoryEnum.HealthcareReimbursement]:
    'Healthcare Reimbursement',
  [StaffExpenseCategoryEnum.AdditionalSalary]: 'Additional Salary',
  [StaffExpenseCategoryEnum.Salary]: 'Salary',
  [StaffExpenseCategoryEnum.Benefits]: 'Benefits',
  [StaffExpenseCategoryEnum.Assessment]: 'Assessment',
  [StaffExpenseCategoryEnum.Other]: 'Other',
};

export const subcategoryLabels: Record<StaffExpensesSubCategoryEnum, string> = {
  [StaffExpensesSubCategoryEnum.Donation]: 'Donation',
  [StaffExpensesSubCategoryEnum.NonCash]: 'Non Cash',
  [StaffExpensesSubCategoryEnum.Withdrawal]: 'Withdrawal',
  [StaffExpensesSubCategoryEnum.Deposit]: 'Deposit',
  [StaffExpensesSubCategoryEnum.MinistryReimbursement]:
    'Ministry Reimbursement',
  [StaffExpensesSubCategoryEnum.HealthcareReimbursement]:
    'Healthcare Reimbursement',
  [StaffExpensesSubCategoryEnum.AdditionalSalary]: 'Additional Salary',
  [StaffExpensesSubCategoryEnum.EarningsMha]: 'Earnings MHA',
  [StaffExpensesSubCategoryEnum.EarningsReb]: 'Earnings REB',
  [StaffExpensesSubCategoryEnum.EarningsNumeric]: 'Earnings Numeric',
  [StaffExpensesSubCategoryEnum.TaxFederal]: 'Tax Federal',
  [StaffExpensesSubCategoryEnum.TaxState]: 'Tax State',
  [StaffExpensesSubCategoryEnum.Deduction_403BPretax]: 'Deduction 403b Pretax',
  [StaffExpensesSubCategoryEnum.Deduction_403BRoth]: 'Deduction 403b Roth',
  [StaffExpensesSubCategoryEnum.DeductionMedical]: 'Deduction Medical',
  [StaffExpensesSubCategoryEnum.SalaryOther]: 'Salary Other',
  [StaffExpensesSubCategoryEnum.MedicalDeduction]: 'Medical Deduction',
  [StaffExpensesSubCategoryEnum.NumericDeduction]: 'Numeric Deduction',
  [StaffExpensesSubCategoryEnum.ProgramBased]: 'Program Based',
  [StaffExpensesSubCategoryEnum.BenefitsOther]: 'Benefits Other',
  [StaffExpensesSubCategoryEnum.Other]: 'Other',
  [StaffExpensesSubCategoryEnum.StaffAssessment]: 'Staff Assessment',
  [StaffExpensesSubCategoryEnum.OtherAssessment]: 'Other Assessment',
  [StaffExpensesSubCategoryEnum.CreditCardFee]: 'Credit Card Fee',
};
