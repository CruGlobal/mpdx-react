import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GoalCalculationAge,
  GoalCalculationRole,
  MpdGoalBenefitsConstantPlanEnum,
  NewStaffGoalCalculationSalaryOverCapEnum,
  NewStaffQuestionnaireMaritalStatusEnum,
  NewStaffQuestionnaireNsoHousingEnum,
  NewStaffQuestionnaireNsoSessionsEnum,
} from 'src/graphql/types.generated';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { getLocalizedAge } from 'src/lib/functions/getLocalizedAge';
import { getLocalizedBenefitsPlan } from 'src/lib/functions/getLocalizedBenefitsPlan';
import { getLocalizedNsoHousing } from 'src/lib/functions/getLocalizedNsoHousing';
import { getLocalizedNsoSessions } from 'src/lib/functions/getLocalizedNsoSessions';
import { getLocalizedRole } from 'src/lib/functions/getLocalizedRole';
import { SelectOption } from './Fields/GoalSettingsSelect';

export interface GoalSettingsOptions {
  age: SelectOption[];
  /** Spouse "joining staff?" choice, mapped to the API `spouseJoining` Boolean. */
  spouseJoining: SelectOption[];
  /** Over-cap salary approval tier (`NewStaffGoalCalculationSalaryOverCapEnum`). */
  allowSalaryOverCap: SelectOption[];
  maritalStatus: SelectOption[];
  role: SelectOption[];
  benefitsPlan: SelectOption[];
  geographicLocation: SelectOption[];
  ministry: SelectOption[];
  nsoTraining: SelectOption[];
  nsoHousing: SelectOption[];
  nsoSessions: SelectOption[];
  calculationsYear: SelectOption[];
  coach: SelectOption[];
  coordinator: SelectOption[];
}

/**
 * Select options for the Goal Settings form.
 *
 * Enum-backed dropdowns are generated directly from the GraphQL enums so the
 * stored values stay in lockstep with the API:
 * - `age` / `role` reuse the MPD Goal Calculator enums (`GoalCalculationAge`,
 *   `GoalCalculationRole`).
 * - `benefitsPlan` reuses the MPD Goal Calculator enum
 *   (`MpdGoalBenefitsConstantPlanEnum`).
 * - `nsoHousing` / `nsoSessions` come from the New Staff Questionnaire enums
 *   (`NewStaffQuestionnaireNsoHousingEnum`, `NewStaffQuestionnaireNsoSessionsEnum`).
 *
 * `geographicLocation` is sourced from the same `useGoalCalculatorConstants`
 * query the MPD Goal Calculator uses, so it reflects the live constants
 * (available locations) and is empty until the query resolves.
 *
 * `maritalStatus` uses the API enum (`NewStaffQuestionnaireMaritalStatusEnum`)
 * and `spouseJoining` maps to the API `spouseJoining` Boolean.
 *
 * The remaining dropdowns (ministry, NSO term, coach, coordinator) are
 * Figma-only and stay mocked until the API exposes them.
 */
export const useGoalSettingsOptions = (): GoalSettingsOptions => {
  const { t } = useTranslation();
  const { goalGeographicConstantMap } = useGoalCalculatorConstants();

  const geographicLocation = useMemo<SelectOption[]>(
    () =>
      Array.from(goalGeographicConstantMap.keys(), (location) => ({
        value: location,
        label: location,
      })),
    [goalGeographicConstantMap],
  );

  return useMemo(
    () => ({
      age: [
        GoalCalculationAge.UnderThirty,
        GoalCalculationAge.ThirtyToThirtyFour,
        GoalCalculationAge.ThirtyFiveToThirtyNine,
        GoalCalculationAge.OverForty,
      ].map((value) => ({ value, label: getLocalizedAge(t, value) })),
      // Spouse "joining staff?" — maps to the API `spouseJoining` Boolean
      // (stored as the Yes/No string values 'true'/'false'). The primary is
      // always joining, so there is no primary control.
      spouseJoining: [
        { value: 'true', label: t('Joining Staff') },
        { value: 'false', label: t('Senior Staff') },
      ],
      allowSalaryOverCap: [
        { value: NewStaffGoalCalculationSalaryOverCapEnum.No, label: t('No') },
        {
          value: NewStaffGoalCalculationSalaryOverCapEnum.UpToBcc,
          label: t('Up to BCC'),
        },
        {
          value: NewStaffGoalCalculationSalaryOverCapEnum.UpToMcc,
          label: t('Up to MCC'),
        },
        {
          value: NewStaffGoalCalculationSalaryOverCapEnum.YesAny,
          label: t('Yes, any amount'),
        },
      ],
      maritalStatus: [
        {
          value: NewStaffQuestionnaireMaritalStatusEnum.Single,
          label: t('Single'),
        },
        {
          value: NewStaffQuestionnaireMaritalStatusEnum.Married,
          label: t('Married'),
        },
        {
          value: NewStaffQuestionnaireMaritalStatusEnum.Sosa,
          label: t('SOSA'),
        },
      ],
      role: [GoalCalculationRole.Field, GoalCalculationRole.Office].map(
        (value) => ({ value, label: getLocalizedRole(t, value) }),
      ),
      benefitsPlan: [
        MpdGoalBenefitsConstantPlanEnum.Select,
        MpdGoalBenefitsConstantPlanEnum.Plus,
        MpdGoalBenefitsConstantPlanEnum.Base,
        MpdGoalBenefitsConstantPlanEnum.Minimum,
        MpdGoalBenefitsConstantPlanEnum.Exempt,
      ].map((value) => ({ value, label: getLocalizedBenefitsPlan(t, value) })),
      geographicLocation,
      ministry: [
        { value: 'Campus: University', label: t('Campus: University') },
        {
          value: 'World Headquarters at Lake Hart',
          label: t('World Headquarters at Lake Hart'),
        },
      ],
      // FIXME: This field is not editable. It comes from the attendee's cohort.
      nsoTraining: [
        { value: 'Fall NSO 2026', label: t('Fall NSO 2026') },
        { value: 'Spring NSO 2026', label: t('Spring NSO 2026') },
      ],
      nsoHousing: [
        NewStaffQuestionnaireNsoHousingEnum.SingleRoom,
        NewStaffQuestionnaireNsoHousingEnum.SharedRoom,
        NewStaffQuestionnaireNsoHousingEnum.CoupleRoom,
        NewStaffQuestionnaireNsoHousingEnum.FamilyRoom,
        NewStaffQuestionnaireNsoHousingEnum.LocalCommuting,
      ].map((value) => ({ value, label: getLocalizedNsoHousing(t, value) })),
      nsoSessions: [
        NewStaffQuestionnaireNsoSessionsEnum.IbsAndNso,
        NewStaffQuestionnaireNsoSessionsEnum.Nso,
      ].map((value) => ({ value, label: getLocalizedNsoSessions(t, value) })),
      calculationsYear: [
        { value: '2026', label: t('2026') },
        { value: '2025', label: t('2025') },
      ],
      coach: [
        { value: 'Amy Wilson', label: t('Amy Wilson') },
        { value: 'Mark Johnson', label: t('Mark Johnson') },
      ],
      coordinator: [
        { value: 'Nancy Coleman', label: t('Nancy Coleman') },
        { value: 'Paul Smith', label: t('Paul Smith') },
      ],
    }),
    [t, geographicLocation],
  );
};
