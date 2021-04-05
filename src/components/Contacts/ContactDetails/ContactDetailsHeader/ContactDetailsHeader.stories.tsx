import React, { ReactElement } from 'react';

import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';

import { ContactDetailsHeader } from './ContactDetailsHeader';
import { GetContactDetailsHeaderQuery } from './ContactDetailsHeader.generated';

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
      />
    </GqlMockedProvider>
  );
};
