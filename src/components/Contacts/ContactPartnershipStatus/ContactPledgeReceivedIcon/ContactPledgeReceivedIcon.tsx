import React from 'react';
import { useTheme } from '@mui/material';
import type { Theme } from '@mui/material/styles/createTheme';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';

interface ContactPledgeReceivedIconProps {
  pledgeReceived: boolean;
}

export const ContactPledgeReceivedIcon: React.FC<
  ContactPledgeReceivedIconProps
> = ({ pledgeReceived }) => {
  const theme = useTheme<Theme>();
  const { t } = useTranslation();

  return pledgeReceived ? (
    <CheckCircleIcon
      style={{ color: theme.palette.mpdxGreen.main }}
      titleAccess={t('Commitment Received')}
    />
  ) : (
    <ErrorIcon color="error" titleAccess={t('Commitment Not Received')} />
  );
};
