import React from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useOptionalAutosaveForm } from 'src/components/Shared/Autosave/AutosaveForm';

interface ContinueButtonProps {
  onClick: () => void;
}

const StyledButton = styled(Button)(({ theme }) => ({
  paddingInline: theme.spacing(4),
  paddingBlock: theme.spacing(1),
}));

export const ContinueButton: React.FC<ContinueButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();

  const allValid = useOptionalAutosaveForm()?.allValid ?? true;

  return (
    <StyledButton
      variant="contained"
      size="large"
      onClick={onClick}
      disabled={!allValid}
    >
      {t('Continue')}
    </StyledButton>
  );
};
