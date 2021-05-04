import { Box } from '@material-ui/core';
import { DateTime } from 'luxon';
import React, { ReactElement } from 'react';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
import {
  DonationsContactFragment,
  DonationsContactFragmentDoc,
} from '../ContactDonationsTab.generated';
import { DonationsGraph } from './DonationsGraph';

export default {
  title: 'Contacts/ContactDonationsTab/DonationsGraph',
  component: DonationsGraph,
};

export const Default = (): ReactElement => {
  const mock = gqlMock<DonationsContactFragment>(DonationsContactFragmentDoc, {
    mocks: {
      nodes: [
        {
          id: 'donation-id',
          donationDate: DateTime.now().toISO(),
          amount: {
            amount: 10,
            convertedAmount: 10,
            currency: 'USD',
            convertedCurrency: 'USD',
          },
        },
        {
          id: 'donation-id-2',
          donationDate: DateTime.now().minus({ month: 1 }).toISO(),
          amount: {
            amount: 20,
            convertedAmount: 20,
            currency: 'USD',
            convertedCurrency: 'USD',
          },
        },
        {
          id: 'donation-id-3',
          donationDate: DateTime.now().minus({ year: 1, month: 2 }).toISO(),
          amount: {
            amount: 30,
            convertedAmount: 30,
            currency: 'USD',
            convertedCurrency: 'USD',
          },
        },
        {
          id: 'donation-id-4',
          donationDate: DateTime.now().minus({ year: 1, month: 10 }).toISO(),
          amount: {
            amount: 40,
            convertedAmount: 40,
            currency: 'USD',
            convertedCurrency: 'USD',
          },
        },
      ],
    },
  });
  return (
    <Box m={2}>
      <DonationsGraph donations={mock} />
    </Box>
  );
};
