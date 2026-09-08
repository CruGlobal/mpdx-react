import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GoalCalculationRole } from 'src/graphql/types.generated';
import { getLocalizedRole } from 'src/lib/functions/getLocalizedRole';
import { GoalSettingsReadOnlyField } from '../Fields/GoalSettingsReadOnlyField';
import { GoalSettingsSelect, SelectOption } from '../Fields/GoalSettingsSelect';
import { GoalSettingsTextField } from '../Fields/GoalSettingsTextField';
import { ColumnHeaderRow, FieldRow, Section } from '../GoalSettingsLayout';
import { GoalSettingsSectionProps } from '../goalSettingsSectionProps';

export const MinistryInformationSection: React.FC<GoalSettingsSectionProps> = ({
  sharedHeader,
  attendee,
}) => {
  const { t } = useTranslation();
  const ministryName = attendee?.ministry?.name;

  const roleOptions = useMemo<SelectOption[]>(
    () =>
      [GoalCalculationRole.Field, GoalCalculationRole.Office].map((value) => ({
        value,
        label: getLocalizedRole(t, value),
      })),
    [t],
  );

  return (
    <Section title={t('Ministry Information')}>
      <ColumnHeaderRow columns={[sharedHeader]} />

      <FieldRow label={t('Location')}>
        <GoalSettingsTextField name="ministryLocation" label={t('Location')} />
      </FieldRow>

      {/* Scenario goals have no attendee, so the row would only ever be blank. */}
      {ministryName && (
        <FieldRow label={t('Ministry')}>
          <GoalSettingsReadOnlyField
            label={t('Ministry')}
            value={ministryName}
          />
        </FieldRow>
      )}

      <FieldRow label={t('Field or Office')}>
        <GoalSettingsSelect
          name="assignmentType"
          label={t('Field or Office')}
          options={roleOptions}
        />
      </FieldRow>
    </Section>
  );
};
