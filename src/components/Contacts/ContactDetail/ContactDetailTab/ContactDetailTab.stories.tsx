import React from 'react';
import { Story } from '@storybook/react';
import { gqlMock } from '../../../../../__tests__/util/graphqlMocking';
import {
  ContactRowFragment,
  ContactRowFragmentDoc,
} from '../../ContactRow.generated';
import { ContactDetailTab } from './ContactDetailTab';

export default {
  title: 'Contacts/Tab/ContactDetailTab',
  component: ContactDetailTab,
};

export const Default: Story = () => {
  const contact = gqlMock<ContactRowFragment>(ContactRowFragmentDoc);
  return <ContactDetailTab contact={contact} />;
};
