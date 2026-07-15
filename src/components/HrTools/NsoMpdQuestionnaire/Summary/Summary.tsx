import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Confirmation } from 'src/components/Shared/Modal/Confirmation/Confirmation';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { BackButton } from '../Shared/BackButton';
import { useNsoMpdQuestionnaire } from '../Shared/NsoMpdQuestionnaireContext';
import { NsoMpdQuestionnaireLayout } from '../Shared/NsoMpdQuestionnaireLayout';
import { QuestionnaireActionButton } from '../Shared/QuestionnaireActionButton';
import { SummarySection } from './SummarySection';
import { useSummarySections } from './useSummarySections';

export const Summary: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const accountListId = useAccountListId();
  const { handleStepChange, handleBack, completeQuestionnaire } =
    useNsoMpdQuestionnaire();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const sections = useSummarySections();

  // Complete the questionnaire, then redirect to the dashboard on success.
  const handleSubmit = async () => {
    await completeQuestionnaire();
    await router.push(`/accountLists/${accountListId}`);
  };

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

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mx={4}>
        <BackButton onClick={handleBack} />
        <QuestionnaireActionButton onClick={() => setConfirmOpen(true)}>
          {t('Submit')}
        </QuestionnaireActionButton>
      </Stack>

      <Confirmation
        isOpen={confirmOpen}
        title={t('Submit Questionnaire')}
        message={t(
          "Once you submit, you won't be able to make any more changes. Do you want to continue?",
        )}
        confirmLabel={t('Submit')}
        cancelLabel={t('Cancel')}
        mutation={handleSubmit}
        handleClose={() => setConfirmOpen(false)}
      />
    </NsoMpdQuestionnaireLayout>
  );
};
