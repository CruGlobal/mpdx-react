import React from 'react';
import { useTranslation } from 'react-i18next';
import { QuestionnaireActionButton } from './QuestionnaireActionButton';

interface BackButtonProps {
  onClick: () => void;
}

/**
 * Secondary action that returns the user to the previous questionnaire step. Unlike Continue, it is
 * always enabled so a user can retreat even when the current step's fields are invalid.
 */
export const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <QuestionnaireActionButton onClick={onClick} variant="outlined">
      {t('Back')}
    </QuestionnaireActionButton>
  );
};
