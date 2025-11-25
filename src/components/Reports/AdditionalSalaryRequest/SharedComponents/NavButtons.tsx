import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 4),
}));

interface SubmitButtonProps {
  handleClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  handleClick,
  type = 'button',
}) => {
  const { t } = useTranslation();

  return (
    <Tooltip title={t('Submit your additional salary request.')}>
      <StyledButton
        variant="contained"
        size="small"
        onClick={handleClick}
        type={type}
      >
        {t('Submit')}
      </StyledButton>
    </Tooltip>
  );
};

export const BackButton: React.FC = () => {
  const { t } = useTranslation();
  const { handleBack } = useAdditionalSalaryRequest();

  return (
    <Tooltip title={t('Return to the previous section.')}>
      <StyledButton variant="outlined" size="small" onClick={handleBack}>
        {t('Back')}
      </StyledButton>
    </Tooltip>
  );
};

export const ContinueButton: React.FC = () => {
  const { t } = useTranslation();
  const { handleContinue } = useAdditionalSalaryRequest();

  return (
    <Tooltip
      title={t(
        'Proceed to the next section. Your progress is automatically saved as you go.',
      )}
    >
      <StyledButton variant="contained" size="small" onClick={handleContinue}>
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
        size="small"
        onClick={handleCancel}
      >
        {t('Cancel')}
      </StyledButton>
    </Tooltip>
  );
};
