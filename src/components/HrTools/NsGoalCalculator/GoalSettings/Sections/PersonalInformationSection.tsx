import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GoalSettingsNumberField } from '../Fields/GoalSettingsNumberField';
import { GoalSettingsSelect } from '../Fields/GoalSettingsSelect';
import { ColumnHeaderRow, FieldRow, Section } from '../GoalSettingsLayout';
import { GoalSettingsSectionProps } from '../goalSettingsSectionProps';

export const PersonalInformationSection: React.FC<GoalSettingsSectionProps> = ({
  hasSpouse,
  primaryName,
  spouseName,
  visibleHeaders,
  options,
}) => {
  const { t } = useTranslation();

  return (
    <Section title={t('Personal Information')}>
      <ColumnHeaderRow columns={visibleHeaders} />

      <FieldRow label={t('Marital Status')}>
        <GoalSettingsSelect
          name="maritalStatus"
          label={t('Marital Status')}
          options={options.maritalStatus}
        />
      </FieldRow>

      <FieldRow label={t('Staff Status')}>
        <Typography variant="body1" color="text.secondary">
          {t('Joining Staff')}
        </Typography>
        {hasSpouse && (
          <GoalSettingsSelect
            name="spouseJoining"
            label={t('Staff Status')}
            personName={spouseName}
            options={options.spouseJoining}
          />
        )}
      </FieldRow>

      <FieldRow label={t('Age')}>
        <GoalSettingsSelect
          name="age"
          label={t('Age')}
          personName={primaryName}
          options={options.age}
        />
        {hasSpouse && (
          <GoalSettingsSelect
            name="spouseAge"
            label={t('Age')}
            personName={spouseName}
            options={options.age}
          />
        )}
      </FieldRow>

      <FieldRow label={t('Full Time Years on Staff')}>
        <GoalSettingsNumberField
          name="tenure"
          label={t('Full Time Years on Staff')}
          personName={primaryName}
        />
        {hasSpouse && (
          <GoalSettingsNumberField
            name="spouseTenure"
            label={t('Full Time Years on Staff')}
            personName={spouseName}
          />
        )}
      </FieldRow>

      {/* No API field — UI only (MPDX-9764). */}
      <FieldRow
        label={t('Dependents')}
        helperText={t('If SOSA, can include spouse')}
      >
        <GoalSettingsNumberField name="dependents" label={t('Dependents')} />
      </FieldRow>
    </Section>
  );
};
