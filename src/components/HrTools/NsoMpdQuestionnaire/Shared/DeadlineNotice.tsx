import React from 'react';
import { Alert } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { deadlineFormat } from '../../Shared/questionnaireDeadline';
import { useNsoMpdQuestionnaire } from './NsoMpdQuestionnaireContext';

/** The household's deadline on every step: when it is due, or that it passed and who can reopen it. */
export const DeadlineNotice: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { questionnaire } = useNsoMpdQuestionnaire();

  if (!questionnaire || questionnaire.completed) {
    return null;
  }

  const { deadline, locked } = questionnaire;
  const date = deadline ? deadlineFormat(deadline, locale) : '';
  const pastDeadline =
    !!deadline && DateTime.fromISO(deadline) < DateTime.now();

  // The API also locks a household whose goal was already sent, deadline or not
  if (locked && !pastDeadline) {
    return (
      <Alert severity="info" sx={{ mx: 4 }}>
        {t(
          "Your MPD goal was already sent, so this questionnaire can't change.",
        )}
      </Alert>
    );
  }
  if (locked) {
    return (
      <Alert severity="warning" sx={{ mx: 4 }}>
        {t(
          'The deadline for this questionnaire passed on {{date}}. To change or submit it, ask the MPD team at mpdhelp@cru.org to reopen it.',
          { date },
        )}
      </Alert>
    );
  }
  if (!deadline) {
    return null;
  }
  return (
    <Alert severity="info" sx={{ mx: 4 }}>
      {t("Due {{date}}. After that you can't change or submit it.", {
        date,
      })}
    </Alert>
  );
};
