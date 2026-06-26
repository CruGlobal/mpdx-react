import React from 'react';
import { useTranslation } from 'react-i18next';
import { GoalSettingsSelect } from '../Fields/GoalSettingsSelect';
import { GoalSettingsYesNoField } from '../Fields/GoalSettingsYesNoField';
import { ColumnHeaderRow, FieldRow, Section } from '../GoalSettingsLayout';
import { GoalSettingsSectionProps } from '../goalSettingsSectionProps';

export const ExemptionsSection: React.FC<GoalSettingsSectionProps> = ({
  hasSpouse,
  primaryName,
  spouseName,
  visibleHeaders,
  options,
}) => {
  const { t } = useTranslation();

  return (
    <Section title={t('Exemptions & Exceptions')}>
      <ColumnHeaderRow columns={visibleHeaders} />

      <FieldRow label={t('Healthcare Exempt')}>
        <GoalSettingsYesNoField
          name="healthcareExempt"
          label={t('Healthcare Exempt')}
          personName={primaryName}
        />
        {hasSpouse && (
          <GoalSettingsYesNoField
            name="spouseHealthcareExempt"
            label={t('Healthcare Exempt')}
            personName={spouseName}
          />
        )}
      </FieldRow>

      <FieldRow label={t('SECA Exempt')}>
        <GoalSettingsYesNoField
          name="secaExempt"
          label={t('SECA Exempt')}
          personName={primaryName}
        />
        {hasSpouse && (
          <GoalSettingsYesNoField
            name="spouseSecaExempt"
            label={t('SECA Exempt')}
            personName={spouseName}
          />
        )}
      </FieldRow>

      <FieldRow label={t('Allow Salary Over Cap')}>
        <GoalSettingsSelect
          name="allowSalaryOverCap"
          label={t('Allow Salary Over Cap')}
          options={options.allowSalaryOverCap}
        />
      </FieldRow>

      <FieldRow label={t('Allow Debt Over Cap')}>
        <GoalSettingsYesNoField
          name="allowDebtOverCap"
          label={t('Allow Debt Over Cap')}
        />
      </FieldRow>
    </Section>
  );
};
