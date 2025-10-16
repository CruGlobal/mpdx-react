import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface ContinueButtonProps {
  onClick: () => void;
}

const StyledButton = styled(Button)(({ theme }) => ({
  paddingLeft: theme.spacing(4),
  paddingRight: theme.spacing(4),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}));

export const ContinueButton: React.FC<ContinueButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <Tooltip
      title={t(
        'Proceed to the next section. Your progress is automatically saved as you go.',
      )}
    >
      <span>
        <StyledButton variant="contained" size="large" onClick={onClick}>
          {t('Continue')}
        </StyledButton>
      </span>
    </Tooltip>
  );
};
