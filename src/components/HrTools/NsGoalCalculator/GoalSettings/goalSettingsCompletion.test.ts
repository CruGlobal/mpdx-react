import {
  GoalCalculationAge,
  GoalCalculationRole,
  MpdGoalBenefitsConstantPlanEnum,
  NewStaffQuestionnaireMaritalStatusEnum,
} from 'src/graphql/types.generated';
import { isGoalSettingsComplete } from './goalSettingsCompletion';
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
  ministryExpenses: '',
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
