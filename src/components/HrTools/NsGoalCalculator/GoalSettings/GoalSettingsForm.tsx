import React, { useMemo } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  styled,
} from '@mui/material';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import { GoalSettingsHeader } from './GoalSettingsHeader';
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
import {
  GoalSettingsFormValues,
  GoalSettingsPerson,
} from './goalSettingsFormValues';
import { getGoalSettingsSchema } from './goalSettingsSchema';
import { GoalSettingsSectionProps } from './goalSettingsSectionProps';
import { useNewStaffGoalCalculation } from './useNewStaffGoalCalculation';

// Padded, full-height scroll container for the form. The sticky action bar below
// breaks out of this exact spacing(4) padding, so the two are defined together
// here to keep the padding and its negative-margin breakout in sync.
const ScrollContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(4),
  width: '100%',
  '@media screen': {
    height: `calc(100vh - ${navBarHeight})`,
    overflow: 'auto',
  },
}));

/**
 * Sticky save/cancel bar pinned to the bottom of the scroll area.
 *
 * ScrollContainer (the scrolling ancestor above) wraps this form in
 * spacing(4) = 32px padding on every side. This bar breaks out of that padding
 * so it spans the full width and sits flush against the scroll-area edges. Each
 * side cancels the 32px:
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

export type GoalSettingsFormProps =
  | { accountListId: string }
  | { scenarioGoalId: string };

export const GoalSettingsForm: React.FC<GoalSettingsFormProps> = (props) => {
  const { t } = useTranslation();
  const validationSchema = useMemo(() => getGoalSettingsSchema(t), [t]);

  const {
    goalCalculation: calculation,
    fallback,
    isScenario,
    save,
  } = useNewStaffGoalCalculation(props);

  // The header and preview need the account list explicitly; a scenario goal
  // has none, so pass null — the preview then omits it from the request.
  const accountListId = 'accountListId' in props ? props.accountListId : null;

  if (!calculation) {
    return <ScrollContainer>{fallback}</ScrollContainer>;
  }

  // Whether the saved record has a spouse identity. The header's read-only
  // person card uses this, so it never shows an empty card for someone who has
  // only just toggled their marital status to married (and has no spouse data
  // entered yet). The editable spouse columns instead follow the live form
  // value (see `isMarried` below).
  const hasSavedSpouse = Boolean(calculation.spouseFirstName);

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

  const handleSubmit = async (
    values: GoalSettingsFormValues,
  ): Promise<void> => {
    await save(formValuesToAttributes(values, { includeIdentity: isScenario }));
  };

  return (
    <ScrollContainer>
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
          };

          return (
            <Form>
              <GoalSettingsHeader
                accountListId={accountListId}
                calculationId={calculation.id}
                primaryPerson={primaryPerson}
                spousePerson={spousePerson}
                mpdGoal={mpdGoal}
                joinedStaffYear={calculation.joinedStaffYear}
                isScenario={isScenario}
              />

              <Divider sx={{ mb: 3 }} />

              {isScenario && <ContactInformationSection {...sectionProps} />}
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
    </ScrollContainer>
  );
};
