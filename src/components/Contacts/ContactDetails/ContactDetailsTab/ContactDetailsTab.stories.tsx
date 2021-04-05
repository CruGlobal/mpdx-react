import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { ContactDetailTab } from './ContactDetailsTab';
import { ContactDetailsTabQuery } from './ContactDetailsTab.generated';

export default {
  title: 'Contacts/Tab/ContactDetailTab',
  component: ContactDetailTab,
};

const accountListId = '111';
const contactId = '222';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<ContactDetailsTabQuery>>
      <ContactDetailTab accountListId={accountListId} contactId={contactId} />
    </GqlMockedProvider>
  );
};
