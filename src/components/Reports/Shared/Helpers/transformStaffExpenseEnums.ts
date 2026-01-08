import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';

export const getLocalizedCategory = (
  value: StaffExpenseCategoryEnum,
  t: TFunction,
) => {
  const categoryLabels: Record<StaffExpenseCategoryEnum, string> = {
    [StaffExpenseCategoryEnum.Donation]: t('Donation'),
    [StaffExpenseCategoryEnum.Transfer]: t('Transfer'),
    [StaffExpenseCategoryEnum.MinistryReimbursement]: t(
      'Ministry Reimbursement',
    ),
    [StaffExpenseCategoryEnum.HealthcareReimbursement]: t(
      'Healthcare Reimbursement',
    ),
    [StaffExpenseCategoryEnum.AdditionalSalary]: t('Additional Salary'),
    [StaffExpenseCategoryEnum.Salary]: t('Salary'),
    [StaffExpenseCategoryEnum.Benefits]: t('Benefits'),
    [StaffExpenseCategoryEnum.Deductions]: t('Deductions'),
    [StaffExpenseCategoryEnum.TaxDeductions]: t('Tax Deductions'),
    [StaffExpenseCategoryEnum.Assessment]: t('Assessment'),
    [StaffExpenseCategoryEnum.Other]: t('Other'),
  };
  return categoryLabels[value] ?? t('Unknown Category');
};

export const getLocalizedSubCategory = (
  value: StaffExpensesSubCategoryEnum,
  t: TFunction,
) => {
  const subcategoryLabels: Record<StaffExpensesSubCategoryEnum, string> = {
    [StaffExpensesSubCategoryEnum.Donation]: t('Donation'),
    [StaffExpensesSubCategoryEnum.Gift]: t('Gift'),
    [StaffExpensesSubCategoryEnum.NonCash]: t('Non Cash'),
    [StaffExpensesSubCategoryEnum.Withdrawal]: t('Withdrawal'),
    [StaffExpensesSubCategoryEnum.Deposit]: t('Deposit'),
    [StaffExpensesSubCategoryEnum.Transfer]: t('Transfer'),
    [StaffExpensesSubCategoryEnum.MinistryReimbursement]: t(
      'Ministry Reimbursement',
    ),
    [StaffExpensesSubCategoryEnum.ExpenseReimbursement]: t(
      'Expense Reimbursement',
    ),
    [StaffExpensesSubCategoryEnum.HealthcareReimbursement]: t(
      'Healthcare Reimbursement',
    ),
    [StaffExpensesSubCategoryEnum.AdditionalSalary]: t('Additional Salary'),
    [StaffExpensesSubCategoryEnum.RegularPay]: t('Regular Pay'),
    [StaffExpensesSubCategoryEnum.OvertimePay]: t('Overtime Pay'),
    [StaffExpensesSubCategoryEnum.DoubleTimePay]: t('Double Time Pay'),
    [StaffExpensesSubCategoryEnum.Bonuses]: t('Bonuses'),
    [StaffExpensesSubCategoryEnum.RetroactivePay]: t('Retroactive Pay'),
    [StaffExpensesSubCategoryEnum.SpecialPay]: t('Special Pay'),
    [StaffExpensesSubCategoryEnum.SalaryAdvance]: t('Salary Advance'),
    [StaffExpensesSubCategoryEnum.EarningsMha]: t('Earnings MHA'),
    [StaffExpensesSubCategoryEnum.EarningsReb]: t('Earnings REB'),
    [StaffExpensesSubCategoryEnum.EarningsNumeric]: t('Earnings Numeric'),
    [StaffExpensesSubCategoryEnum.DisabilityEarnings]: t('Disability Earnings'),
    [StaffExpensesSubCategoryEnum.OtherStandardEarnings]: t(
      'Other Standard Earnings',
    ),
    [StaffExpensesSubCategoryEnum.TaxFederal]: t('Tax Federal'),
    [StaffExpensesSubCategoryEnum.TaxState]: t('Tax State'),
    [StaffExpensesSubCategoryEnum.TaxDeductions]: t('Tax Deductions'),
    [StaffExpensesSubCategoryEnum.PayrollTaxes]: t('Payroll Taxes'),
    [StaffExpensesSubCategoryEnum.Deduction_403BPretax]: t(
      'Deduction 403b Pretax',
    ),
    [StaffExpensesSubCategoryEnum.Deduction_403BRoth]: t('Deduction 403b Roth'),
    [StaffExpensesSubCategoryEnum.DeductionMedical]: t('Deduction Medical'),
    [StaffExpensesSubCategoryEnum.Deductions]: t('Deductions'),
    [StaffExpensesSubCategoryEnum.SalaryOther]: t('Salary Other'),
    [StaffExpensesSubCategoryEnum.MedicalDeduction]: t('Medical Deduction'),
    [StaffExpensesSubCategoryEnum.NumericDeduction]: t('Numeric Deduction'),
    [StaffExpensesSubCategoryEnum.ProgramBased]: t('Program Based'),
    [StaffExpensesSubCategoryEnum.BenefitsOther]: t('Benefits Other'),
    [StaffExpensesSubCategoryEnum.MinistryBenefits]: t('Ministry Benefits'),
    [StaffExpensesSubCategoryEnum.RetirementContributions]: t(
      'Retirement Contributions',
    ),
    [StaffExpensesSubCategoryEnum.DisabilityInsurance]: t(
      'Disability Insurance',
    ),
    [StaffExpensesSubCategoryEnum.LifeInsurance]: t('Life Insurance'),
    [StaffExpensesSubCategoryEnum.LeaveInsurance]: t('Leave Insurance'),
    [StaffExpensesSubCategoryEnum.HealthWelfare]: t('Health & Welfare'),
    [StaffExpensesSubCategoryEnum.HealthWellnessCredits]: t(
      'Health & Wellness Credits',
    ),
    [StaffExpensesSubCategoryEnum.HousingAllowances]: t('Housing Allowances'),
    [StaffExpensesSubCategoryEnum.ImputedIncome]: t('Imputed Income'),
    [StaffExpensesSubCategoryEnum.InternationalPayments]: t(
      'International Payments',
    ),
    [StaffExpensesSubCategoryEnum.MinistryTeamPay]: t('Ministry/Team Pay'),
    [StaffExpensesSubCategoryEnum.HolidayPay]: t('Holiday Pay'),
    [StaffExpensesSubCategoryEnum.PaidTimeOff]: t('Paid Time Off'),
    [StaffExpensesSubCategoryEnum.SickLeave]: t('Sick Leave'),
    [StaffExpensesSubCategoryEnum.MedicalLeave]: t('Medical Leave'),
    [StaffExpensesSubCategoryEnum.ParentalFamilyLeave]: t(
      'Parental/Family Leave',
    ),
    [StaffExpensesSubCategoryEnum.Bereavement]: t('Bereavement'),
    [StaffExpensesSubCategoryEnum.CivicDuty]: t('Civic Duty'),
    [StaffExpensesSubCategoryEnum.EmergencyWeatherPay]: t(
      'Emergency/Weather Pay',
    ),
    [StaffExpensesSubCategoryEnum.OtherLeave]: t('Other Leave'),
    [StaffExpensesSubCategoryEnum.UnpaidLeave]: t('Unpaid Leave'),
    [StaffExpensesSubCategoryEnum.SabbaticalMinistry]: t('Sabbatical/Ministry'),
    [StaffExpensesSubCategoryEnum.Relocation]: t('Relocation'),
    [StaffExpensesSubCategoryEnum.ShortTermAssignment]: t(
      'Short Term Assignment',
    ),
    [StaffExpensesSubCategoryEnum.ServiceAwards]: t('Service Awards'),
    [StaffExpensesSubCategoryEnum.SeveranceSeparation]: t(
      'Severance/Separation',
    ),
    [StaffExpensesSubCategoryEnum.WorkersCompensation]: t(
      'Workers Compensation',
    ),
    [StaffExpensesSubCategoryEnum.Other]: t('Other'),
    [StaffExpensesSubCategoryEnum.OtherDirectPayment]: t(
      'Other Direct Payment',
    ),
    [StaffExpensesSubCategoryEnum.OtherErCharges]: t('Other ER Charges'),
    [StaffExpensesSubCategoryEnum.StaffAssessment]: t('Staff Assessment'),
    [StaffExpensesSubCategoryEnum.OtherAssessment]: t('Other Assessment'),
    [StaffExpensesSubCategoryEnum.CreditCardFee]: t('Credit Card Fee'),
  };

  return subcategoryLabels[value] ?? t('Unknown Subcategory');
};

export const useLocalizedCategory = (category: StaffExpenseCategoryEnum) => {
  const { t } = useTranslation();
  return getLocalizedCategory(category, t);
};

export const useLocalizedSubCategory = (
  subCategory: StaffExpensesSubCategoryEnum,
) => {
  const { t } = useTranslation();
  return getLocalizedSubCategory(subCategory, t);
};
