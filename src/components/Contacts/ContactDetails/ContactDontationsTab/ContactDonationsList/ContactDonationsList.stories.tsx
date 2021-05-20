import { DateTime } from 'luxon';
import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import { ContactDonationsList } from './ContactDonationsList';
import { ContactDonationsListQuery } from './ContactDonationsList.generated';

export default {
  title: 'Contacts/Tab/ContactDonationsTab/ContactDonationsList',
  component: ContactDonationsList,
};

const accountList = 'account-list-id';
const contactId = 'contact-id';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<ContactDonationsListQuery>
      mocks={{
        ContactDonationsList: {
          donations: {
            totalCount: 125,
            nodes: [...Array(25)].map((x, i) => {
              return {
                donationDate: DateTime.local().minus({ month: i }).toISO,
                amount: {
                  currency: 'USD',
                  convertedCurrency: 'EUR',
                },
              };
            }),
          },
        },
      }}
    >
      <ContactDonationsList accountListId={accountList} contactId={contactId} />
    </GqlMockedProvider>
  );
};
