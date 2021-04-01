import React from 'react';
import { Story } from '@storybook/react';
import { gqlMock } from '../../../../../__tests__/util/graphqlMocking';
import {
  ContactDetailDocument,
  ContactDetailQuery,
  ContactDetailQueryVariables,
} from '../ContactDetail.generated';
import { ContactDetailTab } from './ContactDetailTab';

export default {
  title: 'Contacts/Tab/ContactDetailTab',
  component: ContactDetailTab,
};

export const Default: Story = () => {
  const contact = gqlMock<ContactDetailQuery, ContactDetailQueryVariables>(
    ContactDetailDocument,
    {
      variables: {
        accountListId: 'accountList-Id',
        contactId: 'contactList-Id',
      },
    },
  );
  return <ContactDetailTab contact={contact} />;
};
