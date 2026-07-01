import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOptionalAutosaveForm } from 'src/components/Shared/Autosave/AutosaveForm';
import { QuestionnaireActionButton } from './QuestionnaireActionButton';

interface ContinueButtonProps {
  onClick: () => void;
}

export const ContinueButton: React.FC<ContinueButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();

  const allValid = useOptionalAutosaveForm()?.allValid ?? true;

  return (
    <QuestionnaireActionButton onClick={onClick} disabled={!allValid}>
      {t('Continue')}
    </QuestionnaireActionButton>
  );
};
