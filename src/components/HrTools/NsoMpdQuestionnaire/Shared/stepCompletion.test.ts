import {
  GoalCalculationRole,
  NewStaffQuestionnaireMaritalStatusEnum,
  NewStaffQuestionnaireNsoHousingEnum,
  NewStaffQuestionnaireNsoSessionsEnum,
  NewStaffQuestionnaireVariantEnum,
} from 'src/graphql/types.generated';
import { NsoMpdQuestionnaireStepEnum } from '../NsoMpdQuestionnaireHelper';
import { NewStaffQuestionnaireQuery } from './NewStaffQuestionnaire.generated';
import {
  getCompletionPercentage,
  getIncompleteSteps,
  isStepComplete,
} from './stepCompletion';

type Questionnaire = NonNullable<
  NewStaffQuestionnaireQuery['newStaffQuestionnaire']
>;

const completeSingle: Questionnaire = {
  id: 'questionnaire-1',
  personNumber: '000123456',
  updatedAt: '2026-01-01T00:00:00Z',
  maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Single,
  variant: NewStaffQuestionnaireVariantEnum.SingleMarried,
  phoneNumber: '(305) 000-1111',
  ministryName: 'Campus',
  ministryLocation: 'Miami, FL',
  geographicLocation: 'Miami, FL',
  assignmentType: GoalCalculationRole.Field,
  studentLoanMonthlyPayment: 0,
  carLoanMonthlyPayment: 0,
  creditCardDebtMonthlyPayment: 0,
  nsoHousing: NewStaffQuestionnaireNsoHousingEnum.SingleRoom,
  nsoSessions: NewStaffQuestionnaireNsoSessionsEnum.Nso,
  nsoSpecialNeedsSupportReceived: 0,
  childcareChildrenCount: 0,
};

describe('getCompletionPercentage', () => {
  it('returns 0 for a missing questionnaire', () => {
    expect(getCompletionPercentage(null)).toBe(0);
  });

  it('completes a single staff member without a spouse phone number', () => {
    expect(getCompletionPercentage(completeSingle)).toBe(100);
  });

  it('does not require phone numbers for the review-only personal step', () => {
    const married: Questionnaire = {
      ...completeSingle,
      maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Married,
      phoneNumber: null,
      spousePhoneNumber: null,
    };

    expect(getCompletionPercentage(married)).toBe(100);
  });
});

describe('isStepComplete', () => {
  it('returns false for a missing questionnaire', () => {
    expect(
      isStepComplete(NsoMpdQuestionnaireStepEnum.PersonalInformation, null),
    ).toBe(false);
  });

  it('is complete for every data-entry step when its fields are filled', () => {
    expect(
      isStepComplete(
        NsoMpdQuestionnaireStepEnum.PersonalInformation,
        completeSingle,
      ),
    ).toBe(true);
    expect(
      isStepComplete(
        NsoMpdQuestionnaireStepEnum.MinistryInformation,
        completeSingle,
      ),
    ).toBe(true);
    expect(
      isStepComplete(
        NsoMpdQuestionnaireStepEnum.FinancialInformation,
        completeSingle,
      ),
    ).toBe(true);
    expect(
      isStepComplete(
        NsoMpdQuestionnaireStepEnum.NsoInformation,
        completeSingle,
      ),
    ).toBe(true);
  });

  it('treats 0 as a filled value but null as missing', () => {
    expect(
      isStepComplete(NsoMpdQuestionnaireStepEnum.FinancialInformation, {
        ...completeSingle,
        carLoanMonthlyPayment: 0,
      }),
    ).toBe(true);
    expect(
      isStepComplete(NsoMpdQuestionnaireStepEnum.FinancialInformation, {
        ...completeSingle,
        carLoanMonthlyPayment: null,
      }),
    ).toBe(false);
  });

  it('is incomplete when a required field is missing', () => {
    expect(
      isStepComplete(NsoMpdQuestionnaireStepEnum.MinistryInformation, {
        ...completeSingle,
        ministryLocation: null,
      }),
    ).toBe(false);
    expect(
      isStepComplete(NsoMpdQuestionnaireStepEnum.NsoInformation, {
        ...completeSingle,
        childcareChildrenCount: null,
      }),
    ).toBe(false);
  });

  it('treats the review-only Personal step as complete without any phone number', () => {
    const marriedNoPhones: Questionnaire = {
      ...completeSingle,
      maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Married,
      phoneNumber: null,
      spousePhoneNumber: null,
    };

    expect(
      isStepComplete(
        NsoMpdQuestionnaireStepEnum.PersonalInformation,
        marriedNoPhones,
      ),
    ).toBe(true);
  });
});

describe('getIncompleteSteps', () => {
  it('returns every data-entry step for a missing questionnaire', () => {
    expect(getIncompleteSteps(null)).toEqual([
      NsoMpdQuestionnaireStepEnum.PersonalInformation,
      NsoMpdQuestionnaireStepEnum.MinistryInformation,
      NsoMpdQuestionnaireStepEnum.FinancialInformation,
      NsoMpdQuestionnaireStepEnum.NsoInformation,
    ]);
  });

  it('returns an empty array when every data-entry step is complete', () => {
    expect(getIncompleteSteps(completeSingle)).toEqual([]);
  });

  it('returns only the steps missing a required field', () => {
    expect(
      getIncompleteSteps({ ...completeSingle, ministryLocation: null }),
    ).toEqual([NsoMpdQuestionnaireStepEnum.MinistryInformation]);
  });

  it('flags the financial step for the Sosa variant healthcare dependents field', () => {
    const sosa: Questionnaire = {
      ...completeSingle,
      variant: NewStaffQuestionnaireVariantEnum.Sosa,
      healthcareDependentsCount: null,
    };

    expect(getIncompleteSteps(sosa)).toEqual([
      NsoMpdQuestionnaireStepEnum.FinancialInformation,
    ]);
    expect(
      getIncompleteSteps({ ...sosa, healthcareDependentsCount: 2 }),
    ).toEqual([]);
  });

  it('ignores the Sosa-only healthcare dependents field for non-Sosa variants', () => {
    expect(
      getIncompleteSteps({
        ...completeSingle,
        variant: NewStaffQuestionnaireVariantEnum.SingleMarried,
        healthcareDependentsCount: null,
      }),
    ).toEqual([]);
  });
});
