import React, { ReactElement } from 'react';

import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactDetails } from './ContactDetails';
import { GetContactDetailsQuery } from './ContactDetails.generated';

export default {
  title: 'Contacts/ContactDetails',
};

const accountListId = 'abc';
const contactId = 'contact-1';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<GetContactDetailsQuery>>
      <ContactDetails accountListId={accountListId} contactId={null} />
    </GqlMockedProvider>
  );
};

export const WithContact = (): ReactElement => {
  return (
    <GqlMockedProvider<GetContactDetailsQuery>>
      <ContactDetails accountListId={accountListId} contactId={contactId} />
    </GqlMockedProvider>
  );
};
