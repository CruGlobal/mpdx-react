import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  GoalCalculationAge,
  NewStaffQuestionnaireMaritalStatusEnum,
} from 'src/graphql/types.generated';
import { getLocalizedAge } from 'src/lib/functions/getLocalizedAge';
import { GoalSettingsNumberField } from '../Fields/GoalSettingsNumberField';
import { GoalSettingsSelect, SelectOption } from '../Fields/GoalSettingsSelect';
import { ColumnHeaderRow, FieldRow, Section } from '../GoalSettingsLayout';
import { GoalSettingsSectionProps } from '../goalSettingsSectionProps';

export const PersonalInformationSection: React.FC<GoalSettingsSectionProps> = ({
  hasSpouse,
  primaryName,
  spouseName,
  visibleHeaders,
}) => {
  const { t } = useTranslation();

  const maritalStatusOptions = useMemo<SelectOption[]>(
    () => [
      {
        value: NewStaffQuestionnaireMaritalStatusEnum.Single,
        label: t('Single'),
      },
      {
        value: NewStaffQuestionnaireMaritalStatusEnum.Sosa,
        label: t('SOSA'),
      },
      {
        value: NewStaffQuestionnaireMaritalStatusEnum.Married,
        label: t('Married'),
      },
    ],
    [t],
  );

  const spouseJoiningOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'true', label: t('Joining Staff') },
      { value: 'false', label: t('Senior Staff') },
    ],
    [t],
  );

  const ageOptions = useMemo<SelectOption[]>(
    () =>
      [
        GoalCalculationAge.UnderThirty,
        GoalCalculationAge.ThirtyToThirtyFour,
        GoalCalculationAge.ThirtyFiveToThirtyNine,
        GoalCalculationAge.OverForty,
      ].map((value) => ({ value, label: getLocalizedAge(t, value) })),
    [t],
  );

  return (
    <Section title={t('Personal Information')}>
      <ColumnHeaderRow columns={visibleHeaders} />

      <FieldRow label={t('Marital Status')}>
        <GoalSettingsSelect
          name="maritalStatus"
          label={t('Marital Status')}
          options={maritalStatusOptions}
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
            options={spouseJoiningOptions}
          />
        )}
      </FieldRow>

      <FieldRow label={t('Age')}>
        <GoalSettingsSelect
          name="age"
          label={t('Age')}
          personName={primaryName}
          options={ageOptions}
        />
        {hasSpouse && (
          <GoalSettingsSelect
            name="spouseAge"
            label={t('Age')}
            personName={spouseName}
            options={ageOptions}
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
    </Section>
  );
};
