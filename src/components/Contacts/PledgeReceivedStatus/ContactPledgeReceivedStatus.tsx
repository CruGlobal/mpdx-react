import React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Grid, Hidden, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ContactPledgeReceivedStatusProps {
  pledgeReceived: boolean;
}

export const ContactPledgeReceivedStatus: React.FC<
  ContactPledgeReceivedStatusProps
> = ({ pledgeReceived }) => {
  const { t } = useTranslation();

  const commitmentStatus = pledgeReceived
    ? t('Commitment Received')
    : t('Commitment Not Received');

  const CommitmentIcon = pledgeReceived ? CheckCircleIcon : ErrorIcon;
  const commitmentIconColor = pledgeReceived ? 'success' : 'error';

  return (
    <Hidden smDown>
      <Grid container alignItems="center" spacing={1} wrap="nowrap">
        <Grid item>
          <CommitmentIcon
            color={commitmentIconColor}
            titleAccess={commitmentStatus}
          />
        </Grid>
        <Grid item>
          <Typography variant="body2" color="textSecondary">
            {commitmentStatus}
          </Typography>
        </Grid>
      </Grid>
    </Hidden>
  );
};
