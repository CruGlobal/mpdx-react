import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Alert, Box, Divider, Link, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useGetAccountPreferencesQuery } from 'src/components/Settings/preferences/GetAccountPreferences.generated';
import { useUpdateAccountPreferencesMutation } from 'src/components/Settings/preferences/accordions/UpdateAccountPreferences.generated';
import { Confirmation } from 'src/components/Shared/Modal/Confirmation/Confirmation';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { BackButton } from '../Shared/BackButton';
import { useNsoMpdQuestionnaire } from '../Shared/NsoMpdQuestionnaireContext';
import { NsoMpdQuestionnaireLayout } from '../Shared/NsoMpdQuestionnaireLayout';
import { QuestionnaireActionButton } from '../Shared/QuestionnaireActionButton';
import { getIncompleteSteps } from '../Shared/stepCompletion';
import { SummarySection } from './SummarySection';
import { useSummarySections } from './useSummarySections';

export const Summary: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const accountListId = useAccountListId();
  const { questionnaire, handleStepChange, handleBack, completeQuestionnaire } =
    useNsoMpdQuestionnaire();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const sections = useSummarySections();

  const incompleteSteps = getIncompleteSteps(questionnaire);
  const canSubmit = incompleteSteps.length === 0;
  const incompleteSections = sections.filter((section) =>
    incompleteSteps.includes(section.step),
  );

  const { data } = useGetAccountPreferencesQuery({
    variables: {
      accountListId,
    },
  });
  const [updateAccountPreferences] = useUpdateAccountPreferencesMutation();

  const updateGeographicLocation =
    !!questionnaire?.geographicLocation &&
    data?.accountList?.settings?.geographicLocation !==
      questionnaire?.geographicLocation;

  // Complete the questionnaire, then redirect to the dashboard on success.
  const handleSubmit = async () => {
    await completeQuestionnaire();
    if (updateGeographicLocation) {
      await updateAccountPreferences({
        variables: {
          input: {
            id: accountListId,
            attributes: {
              id: accountListId,
              settings: {
                geographicLocation: questionnaire?.geographicLocation,
              },
            },
          },
        },
      });
    }
    enqueueSnackbar(t('Questionnaire submitted successfully.'), {
      variant: 'success',
    });
    await router.push(`/accountLists/${accountListId}`);
  };

  const message = (
    <>
      {t(
        "Once you submit, you won't be able to make any more changes. Do you want to continue?",
      )}
      {updateGeographicLocation && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {t(
            'Your geographic location will be updated as {{geographicLocation}} in your account settings.',
            { geographicLocation: questionnaire?.geographicLocation },
          )}
        </Alert>
      )}
    </>
  );

  return (
    <NsoMpdQuestionnaireLayout>
      <Box mx={4} my={2}>
        <Stack spacing={2}>
          <Typography variant="h5">{t('Summary')}</Typography>
          <Typography variant="body1">
            {t(
              'Please review your information below, then select Submit to finish. Once submitted, you will be redirected to the dashboard and will not be able to make any further changes.',
            )}
          </Typography>
        </Stack>
        <Divider sx={{ mx: -4, my: 4 }} />
        <Stack spacing={4}>
          {sections.map((section) => (
            <SummarySection
              key={section.title}
              title={section.title}
              rows={section.rows}
              onEdit={() => handleStepChange(section.step)}
            />
          ))}
        </Stack>
      </Box>

      {!canSubmit && (
        <Alert severity="error" sx={{ mx: 4, '& ul': { m: 0, pl: 3 } }}>
          {t('Your form is missing information.')}
          <ul>
            {incompleteSections.map((section) => (
              <li key={section.step}>
                <Link
                  component="button"
                  type="button"
                  onClick={() => handleStepChange(section.step)}
                >
                  {section.title}
                </Link>
              </li>
            ))}
          </ul>
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mx={4}>
        <BackButton onClick={handleBack} />
        <QuestionnaireActionButton
          onClick={() => setConfirmOpen(true)}
          disabled={!canSubmit}
        >
          {t('Submit')}
        </QuestionnaireActionButton>
      </Stack>

      <Confirmation
        isOpen={confirmOpen}
        title={t('Submit Questionnaire')}
        message={message}
        confirmLabel={t('Submit')}
        cancelLabel={t('Cancel')}
        mutation={handleSubmit}
        handleClose={() => setConfirmOpen(false)}
      />
    </NsoMpdQuestionnaireLayout>
  );
};
