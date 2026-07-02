import { NewStaffQuestionnaireVariantEnum } from 'src/graphql/types.generated';
import { safeProgressRatio } from '../../Shared/helpers/safeProgressRatio';
import { NsoMpdQuestionnaireStepEnum } from '../NsoMpdQuestionnaireHelper';
import { NewStaffQuestionnaireQuery } from './NewStaffQuestionnaire.generated';
import { getHasSpouse } from './helpers/getHasSpouse';

type NewStaffQuestionnaire =
  NewStaffQuestionnaireQuery['newStaffQuestionnaire'];
type QuestionnaireField = keyof NonNullable<NewStaffQuestionnaire>;

// The Summary step is a review step, so only these four data-entry steps count toward completion.
const steps: NsoMpdQuestionnaireStepEnum[] = [
  NsoMpdQuestionnaireStepEnum.PersonalInformation,
  NsoMpdQuestionnaireStepEnum.MinistryInformation,
  NsoMpdQuestionnaireStepEnum.FinancialInformation,
  NsoMpdQuestionnaireStepEnum.NsoInformation,
];

const stepRequiredFields: Record<string, QuestionnaireField[]> = {
  [NsoMpdQuestionnaireStepEnum.PersonalInformation]: ['phoneNumber'],
  [NsoMpdQuestionnaireStepEnum.MinistryInformation]: [
    'ministryName',
    'ministryLocation',
    'geographicLocation',
    'assignmentType',
  ],
  [NsoMpdQuestionnaireStepEnum.FinancialInformation]: [
    'studentLoanMonthlyPayment',
    'carLoanMonthlyPayment',
    'creditCardDebtMonthlyPayment',
  ],
  [NsoMpdQuestionnaireStepEnum.NsoInformation]: [
    'nsoHousing',
    'nsoSessions',
    'nsoSpecialNeedsSupportReceived',
    'childcareChildrenCount',
  ],
};

// Extra Financial-step fields that only certain variants require.
const variantRequiredFields: Partial<
  Record<NewStaffQuestionnaireVariantEnum, QuestionnaireField[]>
> = {
  [NewStaffQuestionnaireVariantEnum.Sosa]: ['healthcareDependentsCount'],
  [NewStaffQuestionnaireVariantEnum.SpouseSeniorStaff]: [
    'spouseRequestedAnnualSalary',
    'spouseContribution403bPercentage',
    'spouseMhaAmount',
    'staffConferenceTransfer',
    'accountTransfers',
    'solidSupportRaised',
  ],
};

// 0 and false are valid answers, only null, undefined, and empty strings count as missing.
export const isFieldFilled = (value: unknown): boolean =>
  value !== null && value !== undefined && value !== '';

const getRequiredFields = (
  step: NsoMpdQuestionnaireStepEnum,
  questionnaire: NonNullable<NewStaffQuestionnaire>,
): QuestionnaireField[] => {
  const baseFields = stepRequiredFields[step] ?? [];

  if (step === NsoMpdQuestionnaireStepEnum.PersonalInformation) {
    return getHasSpouse(questionnaire.maritalStatus)
      ? [...baseFields, 'spousePhoneNumber']
      : baseFields;
  }

  if (step !== NsoMpdQuestionnaireStepEnum.FinancialInformation) {
    return baseFields;
  }
  const variantFields = variantRequiredFields[questionnaire.variant] ?? [];
  return [...baseFields, ...variantFields];
};

export const isStepComplete = (
  step: NsoMpdQuestionnaireStepEnum,
  questionnaire: NewStaffQuestionnaire,
): boolean =>
  !!questionnaire &&
  getRequiredFields(step, questionnaire).every((field) =>
    isFieldFilled(questionnaire[field]),
  );

export const getCompletionPercentage = (
  questionnaire: NewStaffQuestionnaire,
): number => {
  if (!questionnaire) {
    return 0;
  }

  const completeCount = steps.filter((step) =>
    isStepComplete(step, questionnaire),
  ).length;
  return Math.round(safeProgressRatio(completeCount, steps.length) * 100);
};
