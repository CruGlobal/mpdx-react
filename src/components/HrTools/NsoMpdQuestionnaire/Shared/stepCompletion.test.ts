import {
  GoalCalculationRole,
  NewStaffQuestionnaireMaritalStatusEnum,
  NewStaffQuestionnaireNsoHousingEnum,
  NewStaffQuestionnaireNsoSessionsEnum,
  NewStaffQuestionnaireVariantEnum,
} from 'src/graphql/types.generated';
import { NewStaffQuestionnaireQuery } from './NewStaffQuestionnaire.generated';
import { getCompletionPercentage } from './stepCompletion';

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

  it('requires the spouse phone number when married', () => {
    const married: Questionnaire = {
      ...completeSingle,
      maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Married,
    };

    expect(getCompletionPercentage(married)).toBe(75);
    expect(
      getCompletionPercentage({
        ...married,
        spousePhoneNumber: '(305) 222-3333',
      }),
    ).toBe(100);
  });
});
