import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import ContactsPage from './[[...contactId]].page';

export default {
  title: 'Contacts/Page',
};

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider>
      <ContactsPage />
    </GqlMockedProvider>
  );
};
