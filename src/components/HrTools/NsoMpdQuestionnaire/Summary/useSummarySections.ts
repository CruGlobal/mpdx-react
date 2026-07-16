import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GoalCalculationRole,
  NewStaffQuestionnaireMaritalStatusEnum,
  NewStaffQuestionnaireVariantEnum,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { getLocalizedAge } from 'src/lib/functions/getLocalizedAge';
import { getLocalizedNsoHousing } from 'src/lib/functions/getLocalizedNsoHousing';
import { getLocalizedNsoSessions } from 'src/lib/functions/getLocalizedNsoSessions';
import { currencyFormat } from 'src/lib/intlFormat';
import { NsoMpdQuestionnaireStepEnum } from '../NsoMpdQuestionnaireHelper';
import { useNsoMpdQuestionnaire } from '../Shared/NsoMpdQuestionnaireContext';
import { SummaryRow } from './SummarySection';

export interface SummarySectionData {
  title: string;
  step: NsoMpdQuestionnaireStepEnum;
  rows: SummaryRow[];
}

const formatText = (value?: string | null): string | null => value || null;
const formatNumber = (value?: number | null): string | null =>
  value === undefined || value === null ? null : value.toString();

/**
 * Resolves the loaded questionnaire into the four read-only Summary sections, formatting each
 * answer for display. Every field the user was asked is listed even when unanswered (its `value` is
 * left `null` so {@link SummarySection} can render a placeholder), letting the user see what they
 * still need to complete. Variant-dependent fields only apply to the relevant variants.
 */
export const useSummarySections = (): SummarySectionData[] => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { questionnaire, hasSpouse } = useNsoMpdQuestionnaire();

  return useMemo<SummarySectionData[]>(() => {
    const {
      firstName,
      lastName,
      maritalStatus,
      variant,
      age,
      tenure,
      address,
      phoneNumber,
      spousePhoneNumber,
      spouseFirstName,
      spouseAge,
      spouseTenure,
      ministryName,
      ministryLocation,
      geographicLocation,
      assignmentType,
      studentLoanMonthlyPayment,
      carLoanMonthlyPayment,
      creditCardDebtMonthlyPayment,
      healthcareDependentsCount,
      spouseRequestedAnnualSalary,
      spouseContribution403bPercentage,
      spouseMhaAmount,
      staffConferenceTransfer,
      accountTransfers,
      nsoHousing,
      nsoSessions,
      nsoSpecialNeedsSupportReceived,
      childcareChildrenCount,
    } = questionnaire ?? {};

    const formatMoney = (value?: number | null): string | null =>
      value === undefined || value === null
        ? null
        : currencyFormat(value, 'USD', locale);

    const assignmentTypeLabel =
      assignmentType === GoalCalculationRole.Office
        ? t('Office')
        : assignmentType === GoalCalculationRole.Field
          ? t('Field')
          : null;

    const familyStatus = maritalStatus
      ? maritalStatus === NewStaffQuestionnaireMaritalStatusEnum.Single
        ? t('Single')
        : t('Married')
      : null;

    // Gate variant/spouse-dependent rows
    const isSosa = variant === NewStaffQuestionnaireVariantEnum.Sosa;
    const isSpouseSeniorStaff =
      variant === NewStaffQuestionnaireVariantEnum.SpouseSeniorStaff;

    return [
      {
        title: t('Personal Information'),
        step: NsoMpdQuestionnaireStepEnum.PersonalInformation,
        rows: [
          {
            label: t('Name'),
            value: [firstName, lastName].filter(Boolean).join(' ') || null,
          },
          { label: t('Family status'), value: familyStatus },
          { label: t('Age'), value: age ? getLocalizedAge(t, age) : null },
          { label: t('Tenure'), value: formatNumber(tenure) },
          { label: t('Address'), value: formatText(address) },
          { label: t('Cell phone'), value: formatText(phoneNumber) },
          ...(hasSpouse
            ? [
                {
                  label: t('Spouse name'),
                  value:
                    [spouseFirstName, lastName].filter(Boolean).join(' ') ||
                    null,
                },
                {
                  label: t('Spouse age'),
                  value: spouseAge ? getLocalizedAge(t, spouseAge) : null,
                },
                {
                  label: t('Spouse tenure'),
                  value: formatNumber(spouseTenure),
                },
                {
                  label: t('Spouse cell phone'),
                  value: formatText(spousePhoneNumber),
                },
              ]
            : []),
        ],
      },
      {
        title: t('Ministry Information'),
        step: NsoMpdQuestionnaireStepEnum.MinistryInformation,
        rows: [
          { label: t('Ministry'), value: formatText(ministryName) },
          { label: t('Location'), value: formatText(ministryLocation) },
          { label: t('Nearby city'), value: formatText(geographicLocation) },
          { label: t('Assignment type'), value: assignmentTypeLabel },
        ],
      },
      {
        title: t('Financial Information'),
        step: NsoMpdQuestionnaireStepEnum.FinancialInformation,
        rows: [
          ...(isSosa
            ? [
                {
                  label: t('Healthcare dependents'),
                  value: formatNumber(healthcareDependentsCount),
                },
              ]
            : []),
          ...(isSpouseSeniorStaff
            ? [
                {
                  label: t("Spouse's requested annual salary"),
                  value: formatMoney(spouseRequestedAnnualSalary),
                },
                {
                  label: t("Spouse's 403(b) contribution"),
                  value:
                    spouseContribution403bPercentage === undefined ||
                    spouseContribution403bPercentage === null
                      ? null
                      : `${spouseContribution403bPercentage}%`,
                },
                {
                  label: t("Spouse's requested MHA"),
                  value: formatMoney(spouseMhaAmount),
                },
                {
                  label: t('Staff conference monthly set-aside'),
                  value: formatMoney(staffConferenceTransfer),
                },
                {
                  label: t('Monthly account transfers'),
                  value: formatMoney(accountTransfers),
                },
              ]
            : []),
          {
            label: t('Student loan monthly payment'),
            value: formatMoney(studentLoanMonthlyPayment),
          },
          {
            label: t('Car loan monthly payment'),
            value: formatMoney(carLoanMonthlyPayment),
          },
          {
            label: t('Credit card monthly payment'),
            value: formatMoney(creditCardDebtMonthlyPayment),
          },
        ],
      },
      {
        title: t('NSO Information'),
        step: NsoMpdQuestionnaireStepEnum.NsoInformation,
        rows: [
          {
            label: t('NSO housing'),
            value: nsoHousing ? getLocalizedNsoHousing(t, nsoHousing) : null,
          },
          {
            label: t('Sessions'),
            value: nsoSessions ? getLocalizedNsoSessions(t, nsoSessions) : null,
          },
          {
            label: t('Special needs support received'),
            value: formatMoney(nsoSpecialNeedsSupportReceived),
          },
          {
            label: t('Childcare children'),
            value: formatNumber(childcareChildrenCount),
          },
        ],
      },
    ];
  }, [questionnaire, hasSpouse, t, locale]);
};
