import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGreeting } from 'src/hooks/useGreeting';

interface GoalsListWelcomeProps {
  firstName?: string;
}

export const GoalsListWelcome: React.FC<GoalsListWelcomeProps> = ({
  firstName,
}) => {
  const { t } = useTranslation();
  const greeting = useGreeting(firstName);
  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
        {greeting}
      </Typography>
      <Typography sx={{ mb: 3 }}>
        {t('Welcome to the MPD Goal Calculator.')}
      </Typography>
    </>
  );
};
