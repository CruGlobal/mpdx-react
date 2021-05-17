import { MockedProvider } from '@apollo/client/testing';
import { DateTime } from 'luxon';
import React from 'react';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
import { render } from '../../../../../../__tests__/util/testingLibraryReactMock';
import {
  ContactDonorAccountsFragment,
  ContactDonorAccountsFragmentDoc,
} from '../ContactDonationsTab.generated';
import { PartnershipInfo } from './PartnershipInfo';

const mock = gqlMock<ContactDonorAccountsFragment>(
  ContactDonorAccountsFragmentDoc,
  {
    mocks: {
      nextAsk: DateTime.local().plus({ month: 3 }).toISO(),
      pledgeCurrency: 'CAD',
      pledgeStartDate: DateTime.local().toISO(),
      lastDonation: {
        donationDate: DateTime.local().toISO(),
      },
    },
  },
);

describe('PartnershipInfo', () => {
  it('test renderer', async () => {
    const { findByRole } = render(
      <MockedProvider>
        <PartnershipInfo contact={mock} />
      </MockedProvider>,
    );

    expect(await findByRole('cell')).toBeVisible();
  });
});
