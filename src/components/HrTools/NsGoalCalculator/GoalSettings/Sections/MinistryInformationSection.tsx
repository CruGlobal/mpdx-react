import React from 'react';
import { useTranslation } from 'react-i18next';
import { GoalSettingsNumberField } from '../Fields/GoalSettingsNumberField';
import { GoalSettingsPlaceholder } from '../Fields/GoalSettingsPlaceholder';
import { GoalSettingsSelect } from '../Fields/GoalSettingsSelect';
import { GoalSettingsTextField } from '../Fields/GoalSettingsTextField';
import { ColumnHeaderRow, FieldRow, Section } from '../GoalSettingsLayout';
import { GoalSettingsSectionProps } from '../goalSettingsSectionProps';

export const MinistryInformationSection: React.FC<GoalSettingsSectionProps> = ({
  sharedHeader,
  options,
}) => {
  const { t } = useTranslation();

  return (
    <Section title={t('Ministry Information')}>
      <ColumnHeaderRow columns={[sharedHeader]} />

      <FieldRow label={t('Location')}>
        <GoalSettingsTextField name="ministryLocation" label={t('Location')} />
      </FieldRow>

      {/* TODO(MPDX-9796): Attendee field */}
      <FieldRow label={t('Ministry')}>
        <GoalSettingsPlaceholder
          label={t('Ministry')}
          value={t('Campus: University')}
        />
      </FieldRow>

      <FieldRow label={t('Field or Office')}>
        <GoalSettingsSelect
          name="assignmentType"
          label={t('Field or Office')}
          options={options.role}
        />
      </FieldRow>

      <FieldRow label={t('Ministry Expenses')}>
        <GoalSettingsNumberField
          name="ministryExpenses"
          label={t('Ministry Expenses')}
          adornment="currency"
        />
      </FieldRow>
    </Section>
  );
};
