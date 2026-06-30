import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  NewStaffQuestionnaireNsoHousingEnum,
  NewStaffQuestionnaireNsoSessionsEnum,
} from 'src/graphql/types.generated';
import { getLocalizedNsoHousing } from 'src/lib/functions/getLocalizedNsoHousing';
import { getLocalizedNsoSessions } from 'src/lib/functions/getLocalizedNsoSessions';
import { GoalSettingsNumberField } from '../Fields/GoalSettingsNumberField';
import { GoalSettingsPlaceholder } from '../Fields/GoalSettingsPlaceholder';
import { GoalSettingsSelect, SelectOption } from '../Fields/GoalSettingsSelect';
import { ColumnHeaderRow, FieldRow, Section } from '../GoalSettingsLayout';
import { GoalSettingsSectionProps } from '../goalSettingsSectionProps';

export const NsoInformationSection: React.FC<GoalSettingsSectionProps> = ({
  sharedHeader,
}) => {
  const { t } = useTranslation();

  const nsoHousingOptions = useMemo<SelectOption[]>(
    () =>
      [
        NewStaffQuestionnaireNsoHousingEnum.SingleRoom,
        NewStaffQuestionnaireNsoHousingEnum.SharedRoom,
        NewStaffQuestionnaireNsoHousingEnum.CoupleRoom,
        NewStaffQuestionnaireNsoHousingEnum.FamilyRoom,
        NewStaffQuestionnaireNsoHousingEnum.LocalCommuting,
      ].map((value) => ({ value, label: getLocalizedNsoHousing(t, value) })),
    [t],
  );

  const nsoSessionsOptions = useMemo<SelectOption[]>(
    () =>
      [
        NewStaffQuestionnaireNsoSessionsEnum.IbsAndNso,
        NewStaffQuestionnaireNsoSessionsEnum.Nso,
      ].map((value) => ({ value, label: getLocalizedNsoSessions(t, value) })),
    [t],
  );

  return (
    <Section title={t('NSO Information')}>
      <ColumnHeaderRow columns={[sharedHeader]} />

      {/* TODO(MPDX-9796): Attendee field */}
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
          options={nsoHousingOptions}
        />
      </FieldRow>

      <FieldRow label={t('Trainings Attending')}>
        <GoalSettingsSelect
          name="nsoSessions"
          label={t('Trainings Attending')}
          options={nsoSessionsOptions}
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

      {/* TODO(MPDX-9797): Computed value — wire up once the calc engine lands. */}
      <FieldRow label={t('Left to Raise')}>
        <GoalSettingsPlaceholder label={t('Left to Raise')} value="—" />
      </FieldRow>
    </Section>
  );
};
