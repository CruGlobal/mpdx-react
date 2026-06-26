import React from 'react';
import { useTranslation } from 'react-i18next';
import { GoalSettingsNumberField } from '../Fields/GoalSettingsNumberField';
import { GoalSettingsSelect } from '../Fields/GoalSettingsSelect';
import { ColumnHeaderRow, FieldRow, Section } from '../GoalSettingsLayout';
import { GoalSettingsSectionProps } from '../goalSettingsSectionProps';

export const HealthcareInformationSection: React.FC<
  GoalSettingsSectionProps
> = ({ sharedHeader, options }) => {
  const { t } = useTranslation();

  return (
    <Section title={t('Healthcare Information')}>
      <ColumnHeaderRow columns={[sharedHeader]} />

      <FieldRow label={t('Benefits Selection')}>
        <GoalSettingsSelect
          name="benefitsPlan"
          label={t('Benefits Selection')}
          options={options.benefitsPlan}
        />
      </FieldRow>

      <FieldRow label={t('Reimbursable Expenses')}>
        <GoalSettingsNumberField
          name="reimbursableExpenses"
          label={t('Reimbursable Expenses')}
          adornment="currency"
        />
      </FieldRow>

      <FieldRow label={t('Healthcare Dependents')}>
        <GoalSettingsNumberField
          name="healthcareDependentsCount"
          label={t('Healthcare Dependents')}
        />
      </FieldRow>
    </Section>
  );
};
