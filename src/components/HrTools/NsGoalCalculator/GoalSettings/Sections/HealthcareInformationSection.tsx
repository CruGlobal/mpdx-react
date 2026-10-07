import React, { useMemo } from 'react';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { getLocalizedBenefitsPlan } from 'src/components/HrTools/Shared/helpers/goalCalculatorConstantsHelper';
import { MpdGoalBenefitsConstantPlanEnum } from 'src/graphql/types.generated';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { GoalSettingsNumberField } from '../Fields/GoalSettingsNumberField';
import { GoalSettingsSelect, SelectOption } from '../Fields/GoalSettingsSelect';
import { ColumnHeaderRow, FieldRow, Section } from '../GoalSettingsLayout';
import { GoalSettingsFormValues } from '../goalSettingsFormValues';
import { GoalSettingsSectionProps } from '../goalSettingsSectionProps';

export const HealthcareInformationSection: React.FC<
  GoalSettingsSectionProps
> = ({ sharedHeader }) => {
  const { t } = useTranslation();

  const {
    values: { calculationsYear },
  } = useFormikContext<GoalSettingsFormValues>();
  const { goalBenefitsPlans } = useGoalCalculatorConstants(
    calculationsYear ? Number(calculationsYear) : null,
  );

  const benefitsPlanOptions = useMemo<SelectOption[]>(() => {
    // Each plan repeats once per family size
    const plans = new Map<MpdGoalBenefitsConstantPlanEnum, string>();
    goalBenefitsPlans.forEach(({ plan, planDisplayName }) => {
      plans.set(plan, getLocalizedBenefitsPlan(t, plan) ?? planDisplayName);
    });
    return Array.from(plans, ([value, label]) => ({ value, label }));
  }, [goalBenefitsPlans, t]);

  return (
    <Section title={t('Healthcare Information')}>
      <ColumnHeaderRow columns={[sharedHeader]} />

      <FieldRow label={t('Benefits Selection')}>
        <GoalSettingsSelect
          name="benefitsPlan"
          label={t('Benefits Selection')}
          options={benefitsPlanOptions}
        />
      </FieldRow>

      <FieldRow
        label={t('Healthcare Dependents')}
        helperText={t('If SOSA, can include spouse')}
      >
        <GoalSettingsNumberField
          name="healthcareDependentsCount"
          label={t('Healthcare Dependents')}
        />
      </FieldRow>
    </Section>
  );
};
