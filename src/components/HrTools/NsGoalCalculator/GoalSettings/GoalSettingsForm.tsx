import React from 'react';
import { Alert, Box, Button, Divider, Skeleton, Stack } from '@mui/material';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import { GoalSettingsHeader } from './GoalSettingsHeader';
import {
  useNewStaffGoalCalculationQuery,
  useUpdateNewStaffGoalCalculationMutation,
} from './NewStaffGoalCalculation.generated';
import { ExemptionsSection } from './Sections/ExemptionsSection';
import { FinancialInformationSection } from './Sections/FinancialInformationSection';
import { HealthcareInformationSection } from './Sections/HealthcareInformationSection';
import { MinistryInformationSection } from './Sections/MinistryInformationSection';
import { NsoInformationSection } from './Sections/NsoInformationSection';
import { PersonalInformationSection } from './Sections/PersonalInformationSection';
import {
  calculationToFormValues,
  formValuesToAttributes,
} from './goalSettingsApiMapping';
import {
  GoalSettingsFormValues,
  GoalSettingsPerson,
} from './goalSettingsFormValues';
import { GoalSettingsSectionProps } from './goalSettingsSectionProps';
import { useGoalSettingsOptions } from './useGoalSettingsOptions';

interface GoalSettingsFormProps {
  accountListId: string;
}

export const GoalSettingsForm: React.FC<GoalSettingsFormProps> = ({
  accountListId,
}) => {
  const { t } = useTranslation();
  const options = useGoalSettingsOptions();

  const { data, loading } = useNewStaffGoalCalculationQuery({
    variables: { accountListId },
  });
  const calculation = data?.newStaffGoalCalculation;
  const [updateCalculation] = useUpdateNewStaffGoalCalculationMutation();

  if (loading) {
    return <Skeleton variant="rectangular" height={400} />;
  }

  if (!calculation) {
    return (
      <Alert severity="info">
        {t('No new staff goal calculation exists for this account.')}
      </Alert>
    );
  }

  // Whether the saved record has a spouse identity. The header's read-only
  // person card uses this, so it never shows an empty card for someone who has
  // only just toggled their marital status to married (and has no spouse data
  // entered yet). The editable spouse columns instead follow the live form
  // value (see `isMarried` below).
  const hasSavedSpouse = Boolean(calculation.spouseFirstName);
  const primaryName = calculation.firstName ?? '';
  const spouseName = calculation.spouseFirstName || t('Spouse');

  const initialValues = calculationToFormValues(calculation);

  const primaryPerson: GoalSettingsPerson = {
    firstName: calculation.firstName ?? '',
    lastName: calculation.lastName ?? '',
    staffAccountId: calculation.personNumber ?? '',
    emailAddress: calculation.emailAddress ?? '',
    phoneNumber: calculation.phoneNumber ?? '',
    address: calculation.address ?? '',
  };
  const spousePerson: GoalSettingsPerson | null = hasSavedSpouse
    ? {
        firstName: calculation.spouseFirstName ?? '',
        lastName: calculation.lastName ?? '',
        staffAccountId: calculation.spousePersonNumber ?? '',
        emailAddress: calculation.spouseEmailAddress ?? '',
        phoneNumber: calculation.spousePhoneNumber ?? '',
        address: calculation.address ?? '',
      }
    : null;

  // TODO: Get goal from calculations
  const mpdGoal =
    (calculation.calculatedResults as { mpdGoal?: number } | null | undefined)
      ?.mpdGoal ?? 0;

  const primaryHeader = `${primaryName} (${t('Joining')})`;
  const spouseHeader = `${spouseName} (${calculation.spouseJoining ? t('Joining') : t('Senior')})`;

  const handleSubmit = async (
    values: GoalSettingsFormValues,
  ): Promise<void> => {
    await updateCalculation({
      variables: {
        input: {
          accountListId,
          id: calculation.id,
          attributes: formValuesToAttributes(values),
        },
      },
    });
  };

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, resetForm, values }) => {
        // Spouse columns follow the live form value, so they appear the moment
        // marital status is set to married — before the change is saved.
        const hasSpouse =
          values.maritalStatus ===
          NewStaffQuestionnaireMaritalStatusEnum.Married;
        const sectionProps: GoalSettingsSectionProps = {
          hasSpouse,
          primaryName,
          spouseName,
          visibleHeaders: hasSpouse
            ? [primaryHeader, spouseHeader]
            : [primaryHeader],
          sharedHeader: hasSpouse
            ? `${primaryHeader} & ${spouseHeader}`
            : primaryHeader,
          options,
        };

        return (
          <Form>
            <GoalSettingsHeader
              primaryPerson={primaryPerson}
              spousePerson={spousePerson}
              mpdGoal={mpdGoal}
              options={options}
            />

            <Divider sx={{ mb: 3 }} />

            <PersonalInformationSection {...sectionProps} />
            <FinancialInformationSection {...sectionProps} />
            <HealthcareInformationSection {...sectionProps} />
            <MinistryInformationSection {...sectionProps} />
            <NsoInformationSection {...sectionProps} />
            <ExemptionsSection {...sectionProps} />

            {/* FIXME: Create a styled-component */}
            <Box
              sx={{
                // MainContent (the scrolling ancestor) wraps this form in
                // spacing(4) = 32px padding on every side. This sticky action
                // bar breaks out of that padding so it spans the full width and
                // sits flush against the scroll-area edges. Each side cancels
                // the 32px:
                //   mx: -4 + px: 4      -> full-bleed width, content stays inset
                //   mb: -4              -> flush at the bottom once fully scrolled
                //   bottom: spacing(-4) -> flush while the bar is still stuck
                position: 'sticky',
                bottom: (theme) => theme.spacing(-4),
                zIndex: 1,
                mt: 2,
                mx: -4,
                mb: -4,
                px: 4,
                py: 2,
                backgroundColor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button color="inherit" onClick={() => resetForm()}>
                  {t('Cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {t('Save & Share')}
                </Button>
              </Stack>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
};
