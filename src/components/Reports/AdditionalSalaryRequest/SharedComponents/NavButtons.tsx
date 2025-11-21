import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 4),
}));

export const ContinueButton: React.FC = () => {
  const { t } = useTranslation();
  const { handleContinue } = useAdditionalSalaryRequest();

  return (
    <Tooltip
      title={t(
        'Proceed to the next section. Your progress is automatically saved as you go.',
      )}
    >
      <StyledButton variant="contained" size="large" onClick={handleContinue}>
        {t('Continue')}
      </StyledButton>
    </Tooltip>
  );
};

export const CancelButton: React.FC = () => {
  const { t } = useTranslation();
  const { handleCancel } = useAdditionalSalaryRequest();

  return (
    <Tooltip title={t('Cancel and return to the previous page.')}>
      <StyledButton
        variant="text"
        color="error"
        size="large"
        onClick={handleCancel}
      >
        {t('Cancel')}
      </StyledButton>
    </Tooltip>
  );
};
