import React, { ReactElement } from 'react';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { ContactDetailTab } from './ContactDetailTab';
import { ContactDetailTabQuery } from './ContactDetailTab.generated';

export default {
  title: 'Contacts/Tab/ContactDetailTab',
  component: ContactDetailTab,
};

const accountListId = '111';
const contactId = '222';

export const Default = (): ReactElement => {
  return (
    <GqlMockedProvider<ContactDetailTabQuery>>
      <ContactDetailTab accountListId={accountListId} contactId={contactId} />
    </GqlMockedProvider>
  );
};
