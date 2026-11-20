import React from 'react';
import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { deadlineFormat } from '../../Shared/questionnaireDeadline';
import { useNsoMpdQuestionnaire } from './NsoMpdQuestionnaireContext';

/** The household's deadline on every step: when it is due, or that it passed and who can reopen it. */
export const DeadlineNotice: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { questionnaire } = useNsoMpdQuestionnaire();

  if (!questionnaire?.deadline || questionnaire.completed) {
    return null;
  }

  const date = deadlineFormat(questionnaire.deadline, locale);
  return questionnaire.locked ? (
    <Alert severity="warning" sx={{ mx: 4 }}>
      {t(
        'The deadline for this questionnaire passed on {{date}}. To change or submit it, ask the MPD team at mpdhelp@cru.org to reopen it.',
        { date },
      )}
    </Alert>
  ) : (
    <Alert severity="info" sx={{ mx: 4 }}>
      {t("Due {{date}}. After that you can't change or submit it.", {
        date,
      })}
    </Alert>
  );
};
