import {
  GoalCalculationAge,
  GoalCalculationRole,
  MpdGoalBenefitsConstantPlanEnum,
  NewStaffQuestionnaireMaritalStatusEnum,
} from 'src/graphql/types.generated';
import {
  GoalCompletionFields,
  isCalculationComplete,
  isGoalSettingsComplete,
} from './goalSettingsCompletion';
import { GoalSettingsFormValues } from './goalSettingsFormValues';

const emptyValues: GoalSettingsFormValues = {
  calculationsYear: '2020',
  firstName: '',
  lastName: '',
  emailAddress: '',
  spouseFirstName: '',
  spouseEmailAddress: '',
  maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Single,
  spouseJoining: 'false',
  age: '',
  spouseAge: '',
  tenure: '',
  spouseTenure: '',
  annualRequestedSalary: '',
  spouseRequestedAnnualSalary: '',
  contribution403bPercentage: '',
  spouseContribution403bPercentage: '',
  spouseMhaAmount: '',
  staffConferenceTransfer: '',
  accountTransfers: '',
  advocacyTransfers: '',
  geographicLocation: '',
  studentLoanMonthlyPayment: '',
  carLoanMonthlyPayment: '',
  creditCardDebtMonthlyPayment: '',
  otherExpenses: '',
  benefitsPlan: '',
  reimbursableExpenses: '',
  healthcareDependentsCount: '',
  ministryLocation: '',
  ministryName: '',
  assignmentType: '',
  nsoHousing: '',
  nsoSessions: '',
  childcareChildrenCount: '',
  nsoSpecialNeedsSupportReceived: '',
  healthcareExempt: 'false',
  spouseHealthcareExempt: 'false',
  secaExempt: 'false',
  spouseSecaExempt: 'false',
  allowSalaryOverCap: '',
  allowDebtOverCap: 'false',
};

const filledSingle: GoalSettingsFormValues = {
  ...emptyValues,
  age: GoalCalculationAge.ThirtyToThirtyFour,
  tenure: 5,
  assignmentType: GoalCalculationRole.Field,
  benefitsPlan: MpdGoalBenefitsConstantPlanEnum.Base,
};

describe('isGoalSettingsComplete', () => {
  it('is false when required fields are empty', () => {
    expect(isGoalSettingsComplete(emptyValues)).toBe(false);
  });

  it('is true when a single staff has age, tenure, role, and benefits plan', () => {
    expect(isGoalSettingsComplete(filledSingle)).toBe(true);
  });

  it('treats zero years on staff as filled', () => {
    expect(isGoalSettingsComplete({ ...filledSingle, tenure: 0 })).toBe(true);
  });

  it.each([
    ['calculation year', { calculationsYear: '' }],
    ['age', { age: '' }],
    ['tenure', { tenure: '' }],
    ['role', { assignmentType: '' }],
    ['benefits plan', { benefitsPlan: '' }],
  ] as Array<[string, Partial<GoalSettingsFormValues>]>)(
    'is false when %s is missing',
    (_label, missing) => {
      expect(isGoalSettingsComplete({ ...filledSingle, ...missing })).toBe(
        false,
      );
    },
  );

  describe('married', () => {
    const filledMarried: GoalSettingsFormValues = {
      ...filledSingle,
      maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Married,
      spouseAge: GoalCalculationAge.OverForty,
      spouseTenure: 3,
    };

    it('is true when both spouses have age and tenure', () => {
      expect(isGoalSettingsComplete(filledMarried)).toBe(true);
    });

    it('is false when the spouse age is missing', () => {
      expect(isGoalSettingsComplete({ ...filledMarried, spouseAge: '' })).toBe(
        false,
      );
    });

    it('is false when the spouse tenure is missing', () => {
      expect(
        isGoalSettingsComplete({ ...filledMarried, spouseTenure: '' }),
      ).toBe(false);
    });

    it('ignores empty spouse fields when single', () => {
      // Spouse fields left blank, but the staff is single, so they are not
      // required.
      expect(isGoalSettingsComplete(filledSingle)).toBe(true);
    });
  });
});

describe('isCalculationComplete', () => {
  // The saved shape, where an unset field is null rather than ''.
  const savedSingle: GoalCompletionFields = {
    maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Single,
    calculationsYear: 2026,
    age: GoalCalculationAge.ThirtyToThirtyFour,
    tenure: 0,
    assignmentType: GoalCalculationRole.Field,
    benefitsPlan: MpdGoalBenefitsConstantPlanEnum.Base,
    spouseAge: null,
    spouseTenure: null,
  };

  it('is true for a single household with every required field saved', () => {
    expect(isCalculationComplete(savedSingle)).toBe(true);
  });

  it.each([
    ['calculationsYear'],
    ['age'],
    ['tenure'],
    ['assignmentType'],
    ['benefitsPlan'],
  ] as Array<[keyof GoalCompletionFields]>)(
    'is false when %s is null',
    (field) => {
      expect(isCalculationComplete({ ...savedSingle, [field]: null })).toBe(
        false,
      );
    },
  );

  it('requires the spouse fields once the household is married', () => {
    const married = {
      ...savedSingle,
      maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Married,
    };

    expect(isCalculationComplete(married)).toBe(false);
    expect(
      isCalculationComplete({
        ...married,
        spouseAge: GoalCalculationAge.OverForty,
        spouseTenure: 3,
      }),
    ).toBe(true);
  });
});
