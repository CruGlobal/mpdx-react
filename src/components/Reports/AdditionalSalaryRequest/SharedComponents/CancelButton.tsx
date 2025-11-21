import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface CancelButtonProps {
  onClick: () => void;
}

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 4),
}));

export const CancelButton: React.FC<CancelButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <Tooltip title={t('Cancel and return to the previous page.')}>
      <span>
        <StyledButton size="large" color="error" onClick={onClick}>
          {t('Cancel')}
        </StyledButton>
      </span>
    </Tooltip>
  );
};
