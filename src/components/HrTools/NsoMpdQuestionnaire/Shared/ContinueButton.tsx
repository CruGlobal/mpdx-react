import React from 'react';
import { useTranslation } from 'react-i18next';
import { QuestionnaireActionButton } from './QuestionnaireActionButton';

interface ContinueButtonProps {
  onClick: () => void;
}

export const ContinueButton: React.FC<ContinueButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <QuestionnaireActionButton onClick={onClick}>
      {t('Continue')}
    </QuestionnaireActionButton>
  );
};
