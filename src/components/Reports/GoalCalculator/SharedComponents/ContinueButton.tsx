import React from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import theme from 'src/theme';

interface ContinueButtonProps {
  onClick: () => void;
  show?: boolean;
}

export const ContinueButton: React.FC<ContinueButtonProps> = ({
  onClick,
  show = true,
}) => {
  const { t } = useTranslation();

  if (!show) {
    return null;
  }

  return (
    <Button
      variant="contained"
      sx={{
        backgroundColor: theme.palette.mpdxBlue.main,
        color: 'white',
        px: 4,
        py: 1,
        '&:hover': {
          backgroundColor: theme.palette.mpdxBlue.dark,
        },
      }}
      onClick={onClick}
    >
      {t('Continue')}
    </Button>
  );
};
