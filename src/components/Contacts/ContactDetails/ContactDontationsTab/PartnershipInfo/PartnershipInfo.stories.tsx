import { DateTime } from 'luxon';
import React, { ReactElement } from 'react';
import { gqlMock } from '../../../../../../__tests__/util/graphqlMocking';
import {
  ContactDonorAccountsFragment,
  ContactDonorAccountsFragmentDoc,
} from '../ContactDonationsTab.generated';
import { PartnershipInfo } from './PartnershipInfo';

export default {
  title: 'Contacts/Tab/ContactDonationsTab/Partnership',
  component: PartnershipInfo,
};

export const Default = (): ReactElement => {
  const mock = gqlMock<ContactDonorAccountsFragment>(
    ContactDonorAccountsFragmentDoc,
    {
      mocks: {
        nextAsk: DateTime.local().plus({ month: 3 }).toISO(),
        pledgeCurrency: 'EUR',
        pledgeStartDate: DateTime.local().toISO(),
        lastDonation: {
          donationDate: DateTime.local().toISO(),
        },
      },
    },
  );
  return <PartnershipInfo contact={mock} />;
};
