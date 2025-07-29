import React from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface ContinueButtonProps {
  onClick: () => void;
}

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.mpdxBlue.main,
  color: 'white',
  paddingLeft: theme.spacing(4),
  paddingRight: theme.spacing(4),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.mpdxBlue.dark,
  },
}));

export const ContinueButton: React.FC<ContinueButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();

  return <StyledButton onClick={onClick}>{t('Continue')}</StyledButton>;
};
