import React, { useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Skeleton,
  Stack,
  styled,
} from '@mui/material';
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
import { getGoalSettingsSchema } from './goalSettingsSchema';
import { GoalSettingsSectionProps } from './goalSettingsSectionProps';

/**
 * Sticky save/cancel bar pinned to the bottom of the scroll area.
 *
 * MainContent (the scrolling ancestor) wraps this form in spacing(4) = 32px
 * padding on every side. This bar breaks out of that padding so it spans the
 * full width and sits flush against the scroll-area edges. Each side cancels the
 * 32px:
 *   marginX -4 + paddingX 4 -> full-bleed width, content stays inset
 *   marginBottom -4         -> flush at the bottom once fully scrolled
 *   bottom spacing(-4)      -> flush while the bar is still stuck
 */
const StickyActionBar = styled(Box)(({ theme }) => ({
  position: 'sticky',
  bottom: theme.spacing(-4),
  zIndex: 1,
  marginInline: theme.spacing(-4),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(-4),
  paddingInline: theme.spacing(4),
  paddingBlock: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
}));

interface GoalSettingsFormProps {
  accountListId: string;
}

export const GoalSettingsForm: React.FC<GoalSettingsFormProps> = ({
  accountListId,
}) => {
  const { t } = useTranslation();
  const validationSchema = useMemo(() => getGoalSettingsSchema(t), [t]);

  const { data, loading, error } = useNewStaffGoalCalculationQuery({
    variables: { accountListId },
  });
  const calculation = data?.newStaffGoalCalculation;
  const [updateCalculation] = useUpdateNewStaffGoalCalculationMutation();

  if (loading) {
    return <Skeleton variant="rectangular" height={400} />;
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
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
    personNumber: calculation.personNumber ?? '',
    emailAddress: calculation.emailAddress ?? '',
    phoneNumber: calculation.phoneNumber ?? '',
    address: calculation.address ?? '',
  };
  const spousePerson: GoalSettingsPerson | null = hasSavedSpouse
    ? {
        firstName: calculation.spouseFirstName ?? '',
        lastName: calculation.lastName ?? '',
        personNumber: calculation.spousePersonNumber ?? '',
        emailAddress: calculation.spouseEmailAddress ?? '',
        phoneNumber: calculation.spousePhoneNumber ?? '',
        address: calculation.address ?? '',
      }
    : null;

  const mpdGoal = calculation.calculations.monthlyGoal;

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
      validationSchema={validationSchema}
      enableReinitialize
      validateOnMount
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, isValid, resetForm, values }) => {
        // Spouse columns follow the live form value, so they appear the moment
        // marital status is set to married — before the change is saved.
        const hasSpouse =
          values.maritalStatus ===
          NewStaffQuestionnaireMaritalStatusEnum.Married;
        const sectionProps: GoalSettingsSectionProps = {
          hasSpouse,
          calculations: calculation.calculations,
          primaryName,
          spouseName,
          visibleHeaders: hasSpouse
            ? [primaryHeader, spouseHeader]
            : [primaryHeader],
          sharedHeader: hasSpouse
            ? `${primaryHeader} & ${spouseHeader}`
            : primaryHeader,
        };

        return (
          <Form>
            <GoalSettingsHeader
              primaryPerson={primaryPerson}
              spousePerson={spousePerson}
              mpdGoal={mpdGoal}
              joinedStaffYear={calculation.joinedStaffYear}
            />

            <Divider sx={{ mb: 3 }} />

            <PersonalInformationSection {...sectionProps} />
            <FinancialInformationSection {...sectionProps} />
            <HealthcareInformationSection {...sectionProps} />
            <MinistryInformationSection {...sectionProps} />
            <NsoInformationSection {...sectionProps} />
            <ExemptionsSection {...sectionProps} />

            <StickyActionBar>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button color="inherit" onClick={() => resetForm()}>
                  {t('Cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isValid || isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : undefined
                  }
                >
                  {t('Save & Share')}
                </Button>
              </Stack>
            </StickyActionBar>
          </Form>
        );
      }}
    </Formik>
  );
};
