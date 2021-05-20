import { MockedProvider } from '@apollo/client/testing';
import { Box } from '@material-ui/core';
import { DateTime } from 'luxon';
import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import { GetContactDonationsQuery } from '../ContactDonationsTab.generated';
import { DonationsGraph } from './DonationsGraph';
import { GetDonationsGraphDocument } from './DonationsGraph.generated';

export default {
  title: 'Contacts/Tab/ContactDonationsTab/DonationsGraph',
  component: DonationsGraph,
};

const accountListId = 'account-list-id';
const donorAccountIds = ['donor-Account-Id'];
const currency = 'USD';

export const Default = (): ReactElement => {
  return (
    <Box m={2}>
      <GqlMockedProvider<GetContactDonationsQuery>
        mocks={{
          GetContactDonations: {
            reportsDonationHistories: {
              periods: [...Array(24)].map((x, i) => {
                const iso = DateTime.now().minus({ month: i }).toISO;
                return {
                  endDate: iso,
                  startDate: iso,
                  convertedTotal: i * 3,
                };
              }),
            },
          },
        }}
      >
        <DonationsGraph
          accountListId="accountListID"
          donorAccountIds={['donorAccountId']}
          convertedCurrency="USD"
        />
      </GqlMockedProvider>
    </Box>
  );
};

export const Loading = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GetDonationsGraphDocument,
            variables: {
              accountListId: accountListId,
              donorAccountIds: donorAccountIds,
              convertCurrency: currency,
            },
          },
          result: {},
          delay: 8640000,
        },
      ]}
    >
      <DonationsGraph
        accountListId="accountListID"
        donorAccountIds={['donorAccountId']}
        convertedCurrency="USD"
      />
    </MockedProvider>
  );
};
