import React, { useState } from 'react';
import { Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { deadlineFormat } from '../../Shared/questionnaireDeadline';
import { useMpdGoalAdmin } from '../MpdGoalAdminContext';
import { QuestionnaireDeadlineDialog } from './QuestionnaireDeadlineDialog';

/** The selected training's questionnaire deadline; MPD Goals admins can edit it. */
export const QuestionnaireDeadline: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { selectedCohort, isGoalsAdmin } = useMpdGoalAdmin();
  const [editing, setEditing] = useState(false);

  if (!selectedCohort) {
    return <span>—</span>;
  }

  const deadline = selectedCohort.questionnaireDeadline
    ? deadlineFormat(selectedCohort.questionnaireDeadline, locale)
    : t('None');

  return (
    <span>
      {deadline}
      {isGoalsAdmin && (
        <>
          {' '}
          <Link
            component="button"
            type="button"
            underline="hover"
            aria-label={t('Edit questionnaire deadline')}
            onClick={() => setEditing(true)}
          >
            {t('Edit')}
          </Link>
        </>
      )}
      {editing && (
        <QuestionnaireDeadlineDialog
          cohort={selectedCohort}
          onClose={() => setEditing(false)}
        />
      )}
    </span>
  );
};
