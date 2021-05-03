import { MockedProvider } from '@apollo/client/testing';
import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { ContactDonationsTab } from './ContactDonationsTab';
import {
  GetContactDonationsDocument,
  GetContactDonationsQuery,
} from './ContactDonationsTab.generated';

export default {
  title: 'Contacts/Tab/ContactDetailsTab/ContactDonations',
  component: ContactDonationsTab,
};

const accountListId = '111';
const contactId = '222';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<GetContactDonationsQuery>>
      <ContactDonationsTab
        accountListId={accountListId}
        contactId={contactId}
      />
    </GqlMockedProvider>
  );
};

export const Loading = (): ReactElement => {
  return (
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
  );
};
