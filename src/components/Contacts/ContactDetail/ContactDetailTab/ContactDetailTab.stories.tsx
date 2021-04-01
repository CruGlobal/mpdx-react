import React from 'react';
import { Story } from '@storybook/react';
import { gqlMock } from '../../../../../__tests__/util/graphqlMocking';
import {
  ContactDetailDocument,
  ContactDetailQuery,
} from '../ContactDetail.generated';
import { ContactDetailTab } from './ContactDetailTab';

export default {
  title: 'Contacts/Tab/ContactDetailTab',
  component: ContactDetailTab,
};

export const Default: Story = () => {
  const contact = gqlMock<ContactDetailQuery>(ContactDetailDocument, {
    mocks: {},
  });
  return <ContactDetailTab contact={contact} />;
};
