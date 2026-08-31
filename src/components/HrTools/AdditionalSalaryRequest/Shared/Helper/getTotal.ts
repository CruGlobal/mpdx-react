const numericFields = [
  'currentYearSalaryNotReceived',
  'previousYearSalaryNotReceived',
  'additionalSalaryWithinMax',
  'adoption',
  'counselingNonMedical',
  'healthcareExpensesExceedingLimit',
  'babysittingMinistryEvents',
  'childrenMinistryTripExpenses',
  'childrenCollegeEducation',
  'movingExpense',
  'seminary',
  'housingDownPayment',
  'autoPurchase',
  'expensesNotApprovedWithin90Days',
] as const;

type NumericField = (typeof numericFields)[number];

type TotalableValues = Partial<Record<NumericField, string | number | null>>;

export const getTotal = (values: TotalableValues): number => {
  return numericFields.reduce((sum, key) => {
    return sum + Number(values[key] || 0);
  }, 0);
};

export const getNonBackpayTotal = (values: TotalableValues): number =>
  getTotal(values) - Number(values.currentYearSalaryNotReceived || 0);
