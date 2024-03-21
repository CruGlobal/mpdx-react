import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { ContactDetailProvider } from '../ContactDetailContext';
import { ContactDetailsHeader } from './ContactDetailsHeader';
import { GetContactDetailsHeaderDocument } from './ContactDetailsHeader.generated';

const accountListId = 'accountList-1';
const contactId = 'contact-1';

export default {
  title: 'Contacts/ContactDetails/Header',
  component: ContactDetailsHeader,
};

export const Default = (): ReactElement => {
  return (
    <ContactsWrapper>
      <ContactDetailProvider>
        <GqlMockedProvider>
          <ContactDetailsHeader
            accountListId={accountListId}
            contactId={contactId}
            onClose={() => {}}
            setContactDetailsLoaded={() => {}}
            contactDetailsLoaded={false}
          />
        </GqlMockedProvider>
      </ContactDetailProvider>
    </ContactsWrapper>
  );
};

export const Loading = (): ReactElement => {
  return (
    <ContactsWrapper>
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
            setContactDetailsLoaded={() => {}}
            contactDetailsLoaded={false}
          />
        </MockedProvider>
      </ContactDetailProvider>
    </ContactsWrapper>
  );
};
