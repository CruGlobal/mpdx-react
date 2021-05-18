import { MockedProvider } from '@apollo/client/testing';
import React, { ReactElement } from 'react';

import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';

import { ContactDetailsHeader } from './ContactDetailsHeader';
import {
  GetContactDetailsHeaderDocument,
  GetContactDetailsHeaderQuery,
} from './ContactDetailsHeader.generated';

export default {
  title: 'Contacts/ContactDetails/Header',
};

const accountListId = 'abc';
const contactId = 'contact-1';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<GetContactDetailsHeaderQuery>>
      <ContactDetailsHeader
        accountListId={accountListId}
        contactId={contactId}
        onClose={() => {}}
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
      <ContactDetailsHeader
        accountListId={accountListId}
        contactId={contactId}
        onClose={() => {}}
      />
    </MockedProvider>
  );
};
