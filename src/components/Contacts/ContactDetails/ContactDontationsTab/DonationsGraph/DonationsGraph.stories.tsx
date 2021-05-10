import { Box } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { contactDonationsMock } from '../ContactDonationsTab.mocks';
import { DonationsGraph } from './DonationsGraph';

export default {
  title: 'Contacts/Tab/ContactDonationsTab/DonationsGraph',
  component: DonationsGraph,
};

export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <DonationsGraph donations={contactDonationsMock} />
    </Box>
  );
};
