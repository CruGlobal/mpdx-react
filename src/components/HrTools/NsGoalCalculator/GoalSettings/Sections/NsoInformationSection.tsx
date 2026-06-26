import React from 'react';
import { useTranslation } from 'react-i18next';
import { GoalSettingsNumberField } from '../Fields/GoalSettingsNumberField';
import { GoalSettingsSelect } from '../Fields/GoalSettingsSelect';
import { ColumnHeaderRow, FieldRow, Section } from '../GoalSettingsLayout';
import { GoalSettingsSectionProps } from '../goalSettingsSectionProps';

export const NsoInformationSection: React.FC<GoalSettingsSectionProps> = ({
  sharedHeader,
  options,
}) => {
  const { t } = useTranslation();

  return (
    <Section title={t('NSO Information')}>
      <ColumnHeaderRow columns={[sharedHeader]} />

      {/* No API field — UI only (MPDX-9764). */}
      <FieldRow label={t('Training')}>
        <GoalSettingsSelect
          name="nsoTraining"
          label={t('Training')}
          options={options.nsoTraining}
        />
      </FieldRow>

      <FieldRow label={t('Housing')}>
        <GoalSettingsSelect
          name="nsoHousing"
          label={t('Housing')}
          options={options.nsoHousing}
        />
      </FieldRow>

      {/* No API field — UI only (MPDX-9764). */}
      <FieldRow label={t('Staff Per Room')}>
        <GoalSettingsNumberField
          name="staffPerRoom"
          label={t('Staff Per Room')}
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

      {/* No API field — UI only, computed (MPDX-9764). */}
      <FieldRow label={t('Left to Raise')}>
        <GoalSettingsNumberField
          name="leftToRaise"
          label={t('Left to Raise')}
          adornment="currency"
          disabled
        />
      </FieldRow>
    </Section>
  );
};
