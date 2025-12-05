import React from 'react';
import { Grid, Hidden, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ContactPledgeReceivedIcon } from '../ContactPartnershipStatus/ContactPledgeReceivedIcon/ContactPledgeReceivedIcon';

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

  return (
    <Hidden smDown>
      <Grid container alignItems="center" spacing={1} wrap="nowrap">
        <Grid item>
          <ContactPledgeReceivedIcon pledgeReceived={pledgeReceived} />
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
