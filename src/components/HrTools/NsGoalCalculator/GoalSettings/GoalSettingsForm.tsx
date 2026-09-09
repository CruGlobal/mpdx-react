import React, { useEffect, useMemo } from 'react';
import { Button, CircularProgress, Divider, Stack } from '@mui/material';
import { Form, Formik, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import { GoalSettingsHeader } from './GoalSettingsHeader';
import { GoalSettingsMissingFields } from './GoalSettingsMissingFields';
import { useGoalSettingsNavigation } from './GoalSettingsNavigationContext';
import { GoalSettingsPreviewProvider } from './GoalSettingsPreviewContext';
import { GoalSettingsScrollContainer } from './GoalSettingsScrollContainer';
import { GoalSettingsWarning } from './GoalSettingsWarning';
import { ContactInformationSection } from './Sections/ContactInformationSection';
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
import { isGoalSettingsComplete } from './goalSettingsCompletion';
import {
  GoalSettingsFormValues,
  GoalSettingsPerson,
} from './goalSettingsFormValues';
import { getGoalSettingsSchema } from './goalSettingsSchema';
import { GoalSettingsSectionProps } from './goalSettingsSectionProps';
import { useNewStaffGoalCalculation } from './useNewStaffGoalCalculation';

/**
 * Reports the form's unsaved edits to the navigation provider, so the sidebar's
 * back link can confirm before discarding them.
 */
const GoalSettingsUnsavedChangesTracker: React.FC = () => {
  const { dirty, resetForm } = useFormikContext<GoalSettingsFormValues>();
  const { registerForm } = useGoalSettingsNavigation();

  useEffect(() => {
    registerForm({ dirty, discard: () => resetForm() });
    // The sidebar swaps this form out for the review/present panes, so without
    // this the provider would keep guarding a Formik that no longer exists.
    return () => registerForm({ dirty: false, discard: () => undefined });
  }, [dirty, resetForm, registerForm]);

  return null;
};

export type GoalSettingsFormProps =
  | { accountListId: string }
  | { scenarioGoalId: string };

export const GoalSettingsForm: React.FC<GoalSettingsFormProps> = (props) => {
  const { t } = useTranslation();
  const validationSchema = useMemo(() => getGoalSettingsSchema(t), [t]);
  const { leave, returnToTable } = useGoalSettingsNavigation();

  const {
    goalCalculation: calculation,
    fallback,
    isScenario,
    // `null` for scenario goals, which have no account list.
    accountListId,
    save,
  } = useNewStaffGoalCalculation(props);

  if (!calculation) {
    return (
      <GoalSettingsScrollContainer>{fallback}</GoalSettingsScrollContainer>
    );
  }

  // Whether the saved record has a spouse identity. The header's read-only
  // person card uses this, so it never shows an empty card for someone who has
  // only just toggled their marital status to married (and has no spouse data
  // entered yet). The editable spouse columns instead follow the live form
  // value (see `isMarried` below).
  const hasSavedSpouse = Boolean(calculation.spouseFirstName);

  // Convert the fraction (0-1) to a percentage (0-100)
  const default403bPercentage = Math.round(
    calculation.calculations.default403bFraction * 100,
  );

  const initialValues = calculationToFormValues(calculation, {
    default403bPercentage,
  });

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

  const handleSubmit = async (
    values: GoalSettingsFormValues,
  ): Promise<void> => {
    try {
      await save(
        formValuesToAttributes(values, { includeIdentity: isScenario }),
      );
    } catch {
      // The global Apollo error link toasts the failure; stay put so the
      // admin can retry without retyping.
      return;
    }
    returnToTable();
  };

  return (
    <GoalSettingsScrollContainer>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        validateOnMount
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values }) => {
          // Spouse columns follow the live form value, so they appear the moment
          // marital status is set to married — before the change is saved.
          const hasSpouse =
            values.maritalStatus ===
            NewStaffQuestionnaireMaritalStatusEnum.Married;
          const seniorStaffSpouse =
            hasSpouse && values.spouseJoining === 'false';
          const primaryName = values.firstName;
          const spouseName = values.spouseFirstName || t('Spouse');
          const primaryHeader = `${primaryName} (${t('Joining')})`;
          const spouseHeader = `${spouseName} (${calculation.spouseJoining ? t('Joining') : t('Senior')})`;
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
            seniorStaff: seniorStaffSpouse,
            attendee: calculation.newStaffCohortAttendee ?? null,
          };

          return (
            <GoalSettingsPreviewProvider
              accountListId={accountListId}
              calculation={calculation}
            >
              <Form>
                <GoalSettingsUnsavedChangesTracker />
                <GoalSettingsHeader
                  primaryPerson={primaryPerson}
                  spousePerson={spousePerson}
                  mpdGoal={mpdGoal}
                  joinedStaffYear={calculation.joinedStaffYear}
                  isScenario={isScenario}
                  isComplete={isGoalSettingsComplete(values)}
                  attendee={calculation.newStaffCohortAttendee ?? null}
                />

                <Divider sx={{ mb: 3 }} />

                {isScenario && <ContactInformationSection {...sectionProps} />}
                <PersonalInformationSection {...sectionProps} />
                <FinancialInformationSection {...sectionProps} />
                <HealthcareInformationSection {...sectionProps} />
                <MinistryInformationSection {...sectionProps} />
                <NsoInformationSection {...sectionProps} />
                <ExemptionsSection {...sectionProps} />

                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mt: 2 }}
                >
                  <GoalSettingsMissingFields />
                  <GoalSettingsWarning />
                  <Stack direction="row" spacing={2} sx={{ ml: 'auto' }}>
                    {/* Wrapped: leave() takes an optional continuation, so
                        passing it directly would hand it the click event. */}
                    <Button color="inherit" onClick={() => leave()}>
                      {t('Cancel')}
                    </Button>
                    {/* Never blocked by validation: clicking it is how an admin
                        finds out what is still missing. */}
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      startIcon={
                        isSubmitting ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : undefined
                      }
                    >
                      {t('Save & Share')}
                    </Button>
                  </Stack>
                </Stack>
              </Form>
            </GoalSettingsPreviewProvider>
          );
        }}
      </Formik>
    </GoalSettingsScrollContainer>
  );
};
