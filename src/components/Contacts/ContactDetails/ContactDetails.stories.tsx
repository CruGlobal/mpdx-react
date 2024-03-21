import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import TestRouter from '__tests__/util/TestRouter';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactDetailProvider } from './ContactDetailContext';
import { ContactDetails } from './ContactDetails';
import { GetContactDetailsHeaderDocument } from './ContactDetailsHeader/ContactDetailsHeader.generated';

const accountListId = 'abc';
const contactId = 'contact-1';

export default {
  title: 'Contacts/ContactDetails',
  component: ContactDetails,
};

const router = {
  query: { accountListId },
};

export const Default = (): ReactElement => {
  return (
    <TestRouter router={router}>
      <GqlMockedProvider>
        <ContactsWrapper>
          <ContactDetailProvider>
            <ContactDetails onClose={() => {}} />
          </ContactDetailProvider>
        </ContactsWrapper>
      </GqlMockedProvider>
    </TestRouter>
  );
};

export const Loading = (): ReactElement => {
  return (
    <TestRouter router={router}>
      <MockedProvider
        mocks={[
          {
            request: {
              query: GetContactDetailsHeaderDocument,
              variables: {
                accountListId,
                contactId,
              },
            },
            result: {},
            delay: 100931731455,
          },
        ]}
      >
        <ContactsWrapper>
          <ContactDetailProvider>
            <ContactDetails onClose={() => {}} />
          </ContactDetailProvider>
        </ContactsWrapper>
      </MockedProvider>
    </TestRouter>
  );
};
