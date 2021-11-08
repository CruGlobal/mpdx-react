import React from 'react';
import { useTheme } from '@material-ui/core';
import type { Theme } from '@material-ui/core/styles/createMuiTheme';
import ErrorIcon from '@material-ui/icons/Error';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { useTranslation } from 'react-i18next';

interface ContactPledgeReceivedIconProps {
  pledgeReceived: boolean;
}

export const ContactPledgeReceivedIcon: React.FC<ContactPledgeReceivedIconProps> = ({
  pledgeReceived,
}) => {
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
