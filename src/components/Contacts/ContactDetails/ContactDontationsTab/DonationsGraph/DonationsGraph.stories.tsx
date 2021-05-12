import { Box } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import { DonationsGraph } from './DonationsGraph';
import { GetDonationsGraphQuery } from './DonationsGraph.generated';

export default {
  title: 'Contacts/Tab/ContactDonationsTab/DonationsGraph',
  component: DonationsGraph,
};

export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <GqlMockedProvider<GetDonationsGraphQuery>>
        <DonationsGraph
          accountListId="accountListId-1"
          donorAccountIds={['donationsAccountIds']}
          convertedCurrency={'USD'}
        />
      </GqlMockedProvider>
    </Box>
  );
};
