import React, { ReactElement } from 'react';

import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { ContactDetails } from './ContactDetails';
import { GetContactDetailsHeaderQuery } from './ContactDetailsHeader/ContactDetailsHeader.generated';

export default {
  title: 'Contacts/ContactDetails',
};

const accountListId = 'abc';
const contactId = 'contact-1';
const onClose = () => {};

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<GetContactDetailsHeaderQuery>>
      <ContactDetails
        accountListId={accountListId}
        contactId={contactId}
        onClose={onClose}
      />
    </GqlMockedProvider>
  );
};
