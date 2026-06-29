import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { GoalSettingsNumberField } from '../Fields/GoalSettingsNumberField';
import { GoalSettingsPlaceholder } from '../Fields/GoalSettingsPlaceholder';
import { GoalSettingsSelect } from '../Fields/GoalSettingsSelect';
import { ColumnHeaderRow, FieldRow, Section } from '../GoalSettingsLayout';
import { GoalSettingsSectionProps } from '../goalSettingsSectionProps';

export const NsoInformationSection: React.FC<GoalSettingsSectionProps> = ({
  sharedHeader,
  options,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <Section title={t('NSO Information')}>
      <ColumnHeaderRow columns={[sharedHeader]} />

      {/* TODO(MPDX-9764): Not editable — comes from the attendee's cohort.
          Replace with the real cohort value once the API exposes it. */}
      <FieldRow label={t('Training')}>
        <GoalSettingsPlaceholder
          label={t('Training')}
          value={t('Fall NSO 2026')}
        />
      </FieldRow>

      <FieldRow label={t('Housing')}>
        <GoalSettingsSelect
          name="nsoHousing"
          label={t('Housing')}
          options={options.nsoHousing}
        />
      </FieldRow>

      <FieldRow label={t('Trainings Attending')}>
        <GoalSettingsSelect
          name="nsoSessions"
          label={t('Trainings Attending')}
          options={options.nsoSessions}
        />
      </FieldRow>

      <FieldRow label={t('Number Needing Childcare')}>
        <GoalSettingsNumberField
          name="childcareChildrenCount"
          label={t('Number Needing Childcare')}
        />
      </FieldRow>

      <FieldRow label={t('Support Raised for NSO')}>
        <GoalSettingsNumberField
          name="nsoSpecialNeedsSupportReceived"
          label={t('Support Raised for NSO')}
          adornment="currency"
        />
      </FieldRow>

      {/* TODO(MPDX-9764): Computed value — wire up once the calc engine lands. */}
      <FieldRow label={t('Left to Raise')}>
        <GoalSettingsPlaceholder
          label={t('Left to Raise')}
          value={currencyFormat(0, 'USD', locale)}
        />
      </FieldRow>
    </Section>
  );
};
