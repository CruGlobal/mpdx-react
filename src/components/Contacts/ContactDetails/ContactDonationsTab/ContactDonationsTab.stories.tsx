import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { DateTime } from 'luxon';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ContactDetailProvider } from '../ContactDetailContext';
import { ContactDonationsTab } from './ContactDonationsTab';
import {
  GetContactDonationsDocument,
  GetContactDonationsQuery,
} from './ContactDonationsTab.generated';

export default {
  title: 'Contacts/Tab/ContactDonationsTab',
  component: ContactDonationsTab,
};

const accountListId = '111';
const contactId = '222';

export const Default = (): ReactElement => {
  return (
    <ContactDetailProvider>
      <GqlMockedProvider<{ GetContactDonations: GetContactDonationsQuery }>
        mocks={{
          GetContactDonations: {
            contact: {
              nextAsk: DateTime.now().plus({ month: 5 }).toISO(),
              pledgeStartDate: DateTime.now().minus({ month: 5 }).toISO(),
              pledgeCurrency: 'USD',
              lastDonation: {
                donationDate: DateTime.now().toISO(),
              },
            },
          },
        }}
      >
        <ContactDonationsTab
          accountListId={accountListId}
          contactId={contactId}
        />
      </GqlMockedProvider>
    </ContactDetailProvider>
  );
};

export const Loading = (): ReactElement => {
  return (
    <ContactDetailProvider>
      <MockedProvider
        mocks={[
          {
            request: {
              query: GetContactDonationsDocument,
              variables: {
                accountListId: accountListId,
                contactId: contactId,
              },
            },
            result: {},
            delay: 8640000,
          },
        ]}
      >
        <ContactDonationsTab
          accountListId={accountListId}
          contactId={contactId}
        />
      </MockedProvider>
    </ContactDetailProvider>
  );
};
