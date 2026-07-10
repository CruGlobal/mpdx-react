import React from 'react';
import { Grid, TextField } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { GoalSettingsTextField } from '../Fields/GoalSettingsTextField';
import { Section } from '../GoalSettingsLayout';
import { GoalSettingsFormValues } from '../goalSettingsFormValues';
import { GoalSettingsSectionProps } from '../goalSettingsSectionProps';

/**
 * Editable identity section shown only for scenario goals. Real goals show the
 * read-only person cards in the header instead.
 *
 * The API has no distinct spouse last name, so "Spouse's Last Name" is a
 * disabled mirror of the shared `lastName` field.
 */
export const ContactInformationSection: React.FC<GoalSettingsSectionProps> = ({
  hasSpouse,
}) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<GoalSettingsFormValues>();

  return (
    <Section title={t('Contact Info')}>
      <Grid container spacing={3}>
        <Grid container size={{ xs: 12, md: 6 }} spacing={2}>
          <GoalSettingsTextField
            name="firstName"
            label={t('First Name')}
            showLabel
          />
          <GoalSettingsTextField
            name="lastName"
            label={t('Last Name')}
            showLabel
          />
          <GoalSettingsTextField
            name="emailAddress"
            label={t('Email address')}
            showLabel
          />
        </Grid>
        {hasSpouse && (
          <Grid container size={{ xs: 12, md: 6 }} spacing={2}>
            <GoalSettingsTextField
              name="spouseFirstName"
              label={t("Spouse's First Name")}
              showLabel
            />
            <TextField
              label={t("Spouse's Last Name")}
              value={values.lastName}
              disabled
              fullWidth
              size="small"
            />
            <GoalSettingsTextField
              name="spouseEmailAddress"
              label={t("Spouse's Email")}
              showLabel
            />
          </Grid>
        )}
      </Grid>
    </Section>
  );
};
