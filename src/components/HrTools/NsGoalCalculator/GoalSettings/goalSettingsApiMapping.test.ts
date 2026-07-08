import {
  GoalCalculationAge,
  GoalCalculationRole,
  MpdGoalBenefitsConstantPlanEnum,
  NewStaffGoalCalculationSalaryOverCapEnum,
  NewStaffQuestionnaireMaritalStatusEnum,
  NewStaffQuestionnaireNsoHousingEnum,
  NewStaffQuestionnaireNsoSessionsEnum,
} from 'src/graphql/types.generated';
import { NewStaffGoalCalculationFieldsFragment } from './NewStaffGoalCalculation.generated';
import {
  calculationToFormValues,
  formValuesToAttributes,
} from './goalSettingsApiMapping';

const emptyGoalSettingsValues = {
  maritalStatus: '',
  annualRequestedSalary: '',
  age: '',
  geographicLocation: '',
  calculationsYear: '',
} as const;

const baseCalculation: NewStaffGoalCalculationFieldsFragment = {
  __typename: 'NewStaffGoalCalculation',
  id: 'goal-1',
  calculations: {
    __typename: 'NewStaffGoalCalculationCalculations',
    salary: 8774,
    seca: 1492,
    contributing403bAmount: 600,
    spouseContributing403bAmount: 390,
    totalContributing403bAmount: 990,
    totalMinistryExpenses: 898,
    medicalExpenses: 300,
    staffConferenceTransfer: 100,
    accountTransfers: 50,
    advocacyTransfers: 25,
    otherExpenses: 0,
    benefitsCharge: 1911,
    adminCharge: 1795,
    attrition: 940,
    monthlyGoal: 17275,
  },
  firstName: 'John',
  lastName: 'Doe',
  emailAddress: 'john@cru.org',
  phoneNumber: '555',
  address: '1 Lake Hart',
  personNumber: '123',
  spouseFirstName: 'Jane',
  spouseEmailAddress: 'jane@cru.org',
  spousePhoneNumber: '556',
  spousePersonNumber: '456',
  maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Married,
  spouseJoining: true,
  age: GoalCalculationAge.ThirtyToThirtyFour,
  spouseAge: GoalCalculationAge.OverForty,
  tenure: 3,
  spouseTenure: 5,
  annualRequestedSalary: 41000,
  spouseRequestedAnnualSalary: 47000,
  contribution403bPercentage: 7,
  spouseContribution403bPercentage: 6,
  spouseMhaAmount: 200,
  staffConferenceTransfer: 10,
  accountTransfers: 20,
  advocacyTransfers: 30,
  geographicLocation: 'Orlando, FL',
  studentLoanMonthlyPayment: 60,
  carLoanMonthlyPayment: 70,
  creditCardDebtMonthlyPayment: 80,
  solidSupportRaised: 90,
  benefitsPlan: MpdGoalBenefitsConstantPlanEnum.Base,
  reimbursableExpenses: 100,
  healthcareDependentsCount: 2,
  ministryName: 'Campus',
  ministryLocation: 'Orlando, FL',
  assignmentType: GoalCalculationRole.Field,
  ministryExpenses: 250,
  nsoHousing: NewStaffQuestionnaireNsoHousingEnum.SingleRoom,
  nsoSessions: NewStaffQuestionnaireNsoSessionsEnum.IbsAndNso,
  nsoSpecialNeedsSupportReceived: 15,
  childcareChildrenCount: 1,
  healthcareExempt: false,
  spouseHealthcareExempt: true,
  secaExempt: false,
  spouseSecaExempt: true,
  allowSalaryOverCap: NewStaffGoalCalculationSalaryOverCapEnum.YesAny,
  allowDebtOverCap: false,
  calculationsYear: 2026,
};

describe('calculationToFormValues', () => {
  it('maps and converts API values to form values', () => {
    const values = calculationToFormValues(baseCalculation);

    expect(values.annualRequestedSalary).toBe(41000);
    expect(values.maritalStatus).toBe(
      NewStaffQuestionnaireMaritalStatusEnum.Married,
    );
    expect(values.calculationsYear).toBe('2026');
    expect(values.nsoSpecialNeedsSupportReceived).toBe(15);
    expect(values.assignmentType).toBe(GoalCalculationRole.Field);
  });

  it('converts booleans to Yes/No strings', () => {
    const values = calculationToFormValues(baseCalculation);

    expect(values.spouseJoining).toBe('true');
    expect(values.healthcareExempt).toBe('false');
    expect(values.spouseHealthcareExempt).toBe('true');
    expect(values.secaExempt).toBe('false');
    expect(values.spouseSecaExempt).toBe('true');
  });

  it('passes the age enum through unchanged', () => {
    const values = calculationToFormValues(baseCalculation);

    expect(values.age).toBe(GoalCalculationAge.ThirtyToThirtyFour);
    expect(values.spouseAge).toBe(GoalCalculationAge.OverForty);
  });

  it('passes the salary-over-cap tier through unchanged', () => {
    const values = calculationToFormValues(baseCalculation);

    expect(values.allowSalaryOverCap).toBe(
      NewStaffGoalCalculationSalaryOverCapEnum.YesAny,
    );
  });

  it('falls back to blank values for null fields', () => {
    const values = calculationToFormValues({
      ...baseCalculation,
      age: null,
      annualRequestedSalary: null,
      geographicLocation: null,
      calculationsYear: null,
    });

    expect(values.age).toBe('');
    expect(values.annualRequestedSalary).toBe('');
    expect(values.geographicLocation).toBe('');
    expect(values.calculationsYear).toBe('');
  });
});

describe('formValuesToAttributes', () => {
  const coupleValues = calculationToFormValues(baseCalculation);
  const singleValues = {
    ...coupleValues,
    maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Single,
  };

  it('converts Yes/No strings back to booleans', () => {
    const attributes = formValuesToAttributes(coupleValues);

    expect(attributes.healthcareExempt).toBe(false);
    expect(attributes.spouseHealthcareExempt).toBe(true);
    expect(attributes.secaExempt).toBe(false);
    expect(attributes.spouseSecaExempt).toBe(true);
  });

  it('sends the spouse joining value when married', () => {
    const attributes = formValuesToAttributes(coupleValues);

    expect(attributes.spouseJoining).toBe(true);
  });

  it('clears spouse fields when there is no spouse', () => {
    const attributes = formValuesToAttributes(singleValues);

    expect(attributes.spouseJoining).toBeNull();
    expect(attributes.spouseAge).toBeNull();
    expect(attributes.spouseRequestedAnnualSalary).toBeNull();
    expect(attributes.spouseHealthcareExempt).toBeNull();
    expect(attributes.spouseMhaAmount).toBeNull();
  });

  it('passes the age enum through to the API', () => {
    const attributes = formValuesToAttributes(coupleValues);

    expect(attributes.age).toBe(GoalCalculationAge.ThirtyToThirtyFour);
    expect(attributes.spouseAge).toBe(GoalCalculationAge.OverForty);
  });

  it('passes the salary-over-cap tier through to the API', () => {
    const attributes = formValuesToAttributes(coupleValues);

    expect(attributes.allowSalaryOverCap).toBe(
      NewStaffGoalCalculationSalaryOverCapEnum.YesAny,
    );
  });

  it('sends the calculation year as a number', () => {
    const attributes = formValuesToAttributes(coupleValues);

    expect(attributes.calculationsYear).toBe(2026);
  });

  it('converts empty strings to null', () => {
    const coupleValues = calculationToFormValues(baseCalculation);
    const attributes = formValuesToAttributes({
      ...coupleValues,
      ...emptyGoalSettingsValues,
    });

    expect(attributes.annualRequestedSalary).toBeNull();
    expect(attributes.age).toBeNull();
    expect(attributes.geographicLocation).toBeNull();
    expect(attributes.calculationsYear).toBeNull();
    expect(attributes.maritalStatus).toBeNull();
  });

  it('preserves a numeric 0 instead of dropping it to null', () => {
    const attributes = formValuesToAttributes({
      ...coupleValues,
      annualRequestedSalary: 0,
      solidSupportRaised: 0,
      tenure: 0,
      childcareChildrenCount: 0,
    });

    expect(attributes.annualRequestedSalary).toBe(0);
    expect(attributes.solidSupportRaised).toBe(0);
    expect(attributes.tenure).toBe(0);
    expect(attributes.childcareChildrenCount).toBe(0);
  });
});
