import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { SalaryInfoQuery } from '../SalaryInfo.generated';

export const defaultCompleteFormValues: CompleteFormValues = {
  currentYearSalaryNotReceived: '0',
  previousYearSalaryNotReceived: '0',
  additionalSalaryWithinMax: '0',
  adoption: '0',
  traditional403bContribution: '0',
  counselingNonMedical: '0',
  healthcareExpensesExceedingLimit: '0',
  babysittingMinistryEvents: '0',
  childrenMinistryTripExpenses: '0',
  childrenCollegeEducation: '0',
  movingExpense: '0',
  seminary: '0',
  housingDownPayment: '0',
  autoPurchase: '0',
  expensesNotApprovedWithin90Days: '0',
  deductTaxDeferredPercent: false,
  phoneNumber: '',
  emailAddress: '',
};

export const defaultSalaryInfoData: SalaryInfoQuery = {
  salaryInfo: {
    id: 'salary-info-1',
    maxAdoptionInt: 15000,
    maxAdoptionUss: 15000,
    maxAutoPurchaseInt: 25000,
    maxAutoPurchaseUss: 25000,
    maxCollegeInt: 21000,
    maxCollegeUss: 21000,
    maxHousingDownPaymentInt: 50000,
    maxHousingDownPaymentUss: 50000,
  },
};
