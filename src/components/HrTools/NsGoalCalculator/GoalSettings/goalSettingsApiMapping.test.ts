import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  GoalCalculationAge,
  GoalCalculationRole,
  NewStaffGoalCalculationSalaryOverCapEnum,
  NewStaffQuestionnaireMaritalStatusEnum,
} from 'src/graphql/types.generated';
import {
  NewStaffGoalCalculationFieldsFragment,
  NewStaffGoalCalculationFieldsFragmentDoc,
} from './NewStaffGoalCalculation.generated';
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

const baseCalculation = gqlMock<NewStaffGoalCalculationFieldsFragment>(
  NewStaffGoalCalculationFieldsFragmentDoc,
  {
    mocks: {
      firstName: 'John',
      lastName: 'Doe',
      emailAddress: 'john@cru.org',
      spouseFirstName: 'Jane',
      spouseEmailAddress: 'jane@cru.org',
      maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Married,
      spouseJoining: true,
      age: GoalCalculationAge.ThirtyToThirtyFour,
      spouseAge: GoalCalculationAge.OverForty,
      annualRequestedSalary: 41000,
      spouseMhaAmount: 200,
      staffConferenceTransfer: 10,
      accountTransfers: 20,
      advocacyTransfers: 30,
      assignmentType: GoalCalculationRole.Field,
      nsoSpecialNeedsSupportReceived: 15,
      healthcareExempt: false,
      spouseHealthcareExempt: true,
      secaExempt: false,
      spouseSecaExempt: true,
      allowSalaryOverCap: NewStaffGoalCalculationSalaryOverCapEnum.YesAny,
      calculationsYear: 2026,
    },
  },
);

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

  describe('403(b) contribution default', () => {
    const noContribution = {
      ...baseCalculation,
      contribution403bPercentage: null,
      spouseContribution403bPercentage: null,
    };

    it('prefills both people with the default when no value is saved', () => {
      const values = calculationToFormValues(noContribution, {
        default403bPercentage: 7,
      });

      expect(values.contribution403bPercentage).toBe(7);
      expect(values.spouseContribution403bPercentage).toBe(7);
    });

    it('keeps a saved contribution instead of the default', () => {
      const values = calculationToFormValues(
        {
          ...baseCalculation,
          contribution403bPercentage: 10,
          spouseContribution403bPercentage: 12,
        },
        { default403bPercentage: 7 },
      );

      expect(values.contribution403bPercentage).toBe(10);
      expect(values.spouseContribution403bPercentage).toBe(12);
    });

    it('preserves an explicit 0% instead of applying the default', () => {
      const values = calculationToFormValues(
        {
          ...baseCalculation,
          contribution403bPercentage: 0,
          spouseContribution403bPercentage: 0,
        },
        { default403bPercentage: 7 },
      );

      expect(values.contribution403bPercentage).toBe(0);
      expect(values.spouseContribution403bPercentage).toBe(0);
    });

    it('leaves the fields blank when no default is provided', () => {
      const values = calculationToFormValues(noContribution);

      expect(values.contribution403bPercentage).toBe('');
      expect(values.spouseContribution403bPercentage).toBe('');
    });
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

  it('sends the senior-staff-only fields when the spouse is senior staff', () => {
    const attributes = formValuesToAttributes({
      ...coupleValues,
      spouseJoining: 'false',
    });

    expect(attributes.spouseMhaAmount).toBe(200);
    expect(attributes.staffConferenceTransfer).toBe(10);
    expect(attributes.accountTransfers).toBe(20);
    expect(attributes.advocacyTransfers).toBe(30);
  });

  it('clears the senior-staff-only fields when the spouse is joining staff', () => {
    const attributes = formValuesToAttributes({
      ...coupleValues,
      spouseJoining: 'true',
    });

    expect(attributes.spouseMhaAmount).toBeNull();
    expect(attributes.staffConferenceTransfer).toBeNull();
    expect(attributes.accountTransfers).toBeNull();
    expect(attributes.advocacyTransfers).toBeNull();
  });

  it('clears the senior-staff-only fields when there is no spouse', () => {
    const attributes = formValuesToAttributes(singleValues);

    expect(attributes.spouseMhaAmount).toBeNull();
    expect(attributes.staffConferenceTransfer).toBeNull();
    expect(attributes.accountTransfers).toBeNull();
    expect(attributes.advocacyTransfers).toBeNull();
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
      tenure: 0,
      childcareChildrenCount: 0,
    });

    expect(attributes.annualRequestedSalary).toBe(0);
    expect(attributes.tenure).toBe(0);
    expect(attributes.childcareChildrenCount).toBe(0);
  });
});

describe('identity fields', () => {
  it('prefills identity values from the calculation', () => {
    const values = calculationToFormValues(baseCalculation);
    expect(values.firstName).toBe('John');
    expect(values.lastName).toBe('Doe');
    expect(values.emailAddress).toBe('john@cru.org');
    expect(values.spouseFirstName).toBe('Jane');
    expect(values.spouseEmailAddress).toBe('jane@cru.org');
  });

  it('omits identity fields by default (real-goal save)', () => {
    const attributes = formValuesToAttributes(
      calculationToFormValues(baseCalculation),
    );
    expect(attributes).not.toHaveProperty('firstName');
    expect(attributes).not.toHaveProperty('lastName');
    expect(attributes).not.toHaveProperty('emailAddress');
    expect(attributes).not.toHaveProperty('spouseFirstName');
    expect(attributes).not.toHaveProperty('spouseEmailAddress');
  });

  it('includes identity fields when includeIdentity is set (scenario save)', () => {
    const attributes = formValuesToAttributes(
      calculationToFormValues(baseCalculation),
      { includeIdentity: true },
    );
    expect(attributes.firstName).toBe('John');
    expect(attributes.lastName).toBe('Doe');
    expect(attributes.emailAddress).toBe('john@cru.org');
    expect(attributes.spouseFirstName).toBe('Jane');
    expect(attributes.spouseEmailAddress).toBe('jane@cru.org');
  });

  it('nulls spouse identity fields when not married, even with includeIdentity', () => {
    const attributes = formValuesToAttributes(
      {
        ...calculationToFormValues(baseCalculation),
        maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Single,
      },
      { includeIdentity: true },
    );
    expect(attributes.spouseFirstName).toBeNull();
    expect(attributes.spouseEmailAddress).toBeNull();
  });
});
