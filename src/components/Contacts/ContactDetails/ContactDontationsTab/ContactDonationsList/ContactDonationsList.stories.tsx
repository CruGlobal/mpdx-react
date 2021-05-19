import { DateTime } from 'luxon';
import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import { ContactDonationsList } from './ContactDonationsList';
import { ContactDonationsListQuery } from './ContactDonationsList.generated';

export default {
  title: 'Contact/Tab/ContactDonationsTab/ContactDonationsList',
  component: ContactDonationsList,
};

const accountList = 'account-list-id';
const contactId = 'contact-id';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<ContactDonationsListQuery>
      mocks={{
        ContactDonationsListQuery: {
          donations: {
            nodes: [...Array(25)].map((x, i) => {
              return {
                donationDate: DateTime.local().minus({ month: i }).toISO,
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
