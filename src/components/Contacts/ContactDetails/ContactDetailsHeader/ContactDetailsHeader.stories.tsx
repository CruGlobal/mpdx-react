import { MockedProvider } from '@apollo/client/testing';
import React, { ReactElement } from 'react';

import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { ContactDetailProvider } from '../ContactDetailContext';

import { ContactDetailsHeader } from './ContactDetailsHeader';
import {
  GetContactDetailsHeaderDocument,
  GetContactDetailsHeaderQuery,
} from './ContactDetailsHeader.generated';
import { ContactsPage } from 'pages/accountLists/[accountListId]/contacts/ContactsPage';

const accountListId = 'accountList-1';
const contactId = 'contact-1';

export default {
  title: 'Contacts/ContactDetails/Header',
  component: ContactDetailsHeader,
};

export const Default = (): ReactElement => {
  return (
    <ContactsPage>
      <ContactDetailProvider>
        <GqlMockedProvider<GetContactDetailsHeaderQuery>>
          <ContactDetailsHeader
            accountListId={accountListId}
            contactId={contactId}
            onClose={() => {}}
          />
        </GqlMockedProvider>
      </ContactDetailProvider>
    </ContactsPage>
  );
};

export const Loading = (): ReactElement => {
  return (
    <ContactsPage>
      <ContactDetailProvider>
        <MockedProvider
          mocks={[
            {
              request: {
                query: GetContactDetailsHeaderDocument,
                variables: {
                  accountListId: accountListId,
                  contactId: contactId,
                },
              },
              result: {},
              delay: 100931731455,
            },
          ]}
        >
          <ContactDetailsHeader
            accountListId={accountListId}
            contactId={contactId}
            onClose={() => {}}
          />
        </MockedProvider>
      </ContactDetailProvider>
    </ContactsPage>
  );
};
