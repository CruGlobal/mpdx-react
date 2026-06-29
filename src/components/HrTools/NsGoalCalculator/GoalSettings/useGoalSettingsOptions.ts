import { useMemo } from 'react';
import { DateTime } from 'luxon';
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
  spouseJoining: SelectOption[];
  allowSalaryOverCap: SelectOption[];
  maritalStatus: SelectOption[];
  role: SelectOption[];
  benefitsPlan: SelectOption[];
  geographicLocation: SelectOption[];
  nsoHousing: SelectOption[];
  nsoSessions: SelectOption[];
  calculationsYear: SelectOption[];
}

/**
 * Select options for the Goal Settings form.
 *
 * @param joinedStaffYear Year the staff member joined staff. The calculation
 *   year options span from this year up to the current year (newest first).
 */
export const useGoalSettingsOptions = (
  joinedStaffYear?: number | null,
): GoalSettingsOptions => {
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

  // Years from joinedStaffYear to the current year, newest first. Falls back to
  // just the current year when joinedStaffYear is missing or in the future.
  const calculationsYear = useMemo<SelectOption[]>(() => {
    const currentYear = DateTime.local().year;
    const startYear = Math.min(joinedStaffYear ?? currentYear, currentYear);
    return Array.from({ length: currentYear - startYear + 1 }, (_, index) => {
      const year = String(currentYear - index);
      return { value: year, label: year };
    });
  }, [joinedStaffYear]);

  return useMemo(
    () => ({
      age: [
        GoalCalculationAge.UnderThirty,
        GoalCalculationAge.ThirtyToThirtyFour,
        GoalCalculationAge.ThirtyFiveToThirtyNine,
        GoalCalculationAge.OverForty,
      ].map((value) => ({ value, label: getLocalizedAge(t, value) })),
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
      calculationsYear,
    }),
    [t, geographicLocation, calculationsYear],
  );
};
