import { MockedProvider } from '@apollo/client/testing';
import React, { ReactElement } from 'react';

import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactDetails } from './ContactDetails';
import {
  GetContactDetailsHeaderDocument,
  GetContactDetailsHeaderQuery,
} from './ContactDetailsHeader/ContactDetailsHeader.generated';

export default {
  title: 'Contacts/ContactDetails',
};

const accountListId = 'abc';
const contactId = 'contact-1';
const onClose = () => {};
const onContactSelected = () => {};

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<GetContactDetailsHeaderQuery>>
      <ContactDetails
        accountListId={accountListId}
        contactId={contactId}
        onClose={onClose}
        onContactSelected={onContactSelected}
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
      <ContactDetails
        accountListId={accountListId}
        contactId={contactId}
        onClose={onClose}
        onContactSelected={onContactSelected}
      />
    </MockedProvider>
  );
};
