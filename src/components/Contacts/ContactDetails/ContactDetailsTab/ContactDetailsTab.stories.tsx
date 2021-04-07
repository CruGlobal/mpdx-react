import { MockedProvider } from '@apollo/client/testing';
import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { ContactDetailsTab } from './ContactDetailsTab';
import {
  ContactDetailsTabDocument,
  ContactDetailsTabQuery,
} from './ContactDetailsTab.generated';

export default {
  title: 'Contacts/Tab/ContactDetailsTab',
  component: ContactDetailsTab,
};

const accountListId = '111';
const contactId = '222';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<ContactDetailsTabQuery>>
      <ContactDetailsTab accountListId={accountListId} contactId={contactId} />
    </GqlMockedProvider>
  );
};

export const Loading = (): ReactElement => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: ContactDetailsTabDocument,
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
      <ContactDetailsTab accountListId={accountListId} contactId={contactId} />
    </MockedProvider>
  );
};
