import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MpdGoalBenefitsConstantPlanEnum } from 'src/graphql/types.generated';
import { getLocalizedBenefitsPlan } from 'src/lib/functions/getLocalizedBenefitsPlan';
import { GoalSettingsNumberField } from '../Fields/GoalSettingsNumberField';
import { GoalSettingsSelect, SelectOption } from '../Fields/GoalSettingsSelect';
import { ColumnHeaderRow, FieldRow, Section } from '../GoalSettingsLayout';
import { GoalSettingsSectionProps } from '../goalSettingsSectionProps';

export const HealthcareInformationSection: React.FC<
  GoalSettingsSectionProps
> = ({ sharedHeader }) => {
  const { t } = useTranslation();

  const benefitsPlanOptions = useMemo<SelectOption[]>(
    () =>
      [
        MpdGoalBenefitsConstantPlanEnum.Select,
        MpdGoalBenefitsConstantPlanEnum.Plus,
        MpdGoalBenefitsConstantPlanEnum.Base,
        MpdGoalBenefitsConstantPlanEnum.Minimum,
        MpdGoalBenefitsConstantPlanEnum.Exempt,
      ].map((value) => ({ value, label: getLocalizedBenefitsPlan(t, value) })),
    [t],
  );

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

      <FieldRow label={t('Reimbursable Expenses')}>
        <GoalSettingsNumberField
          name="reimbursableExpenses"
          label={t('Reimbursable Expenses')}
          adornment="currency"
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
