import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { ContactDetailsTab } from './ContactDetailsTab';
import { ContactDetailsTabQuery } from './ContactDetailsTab.generated';

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
