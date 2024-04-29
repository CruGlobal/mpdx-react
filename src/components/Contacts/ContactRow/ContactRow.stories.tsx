import React from 'react';
import { Meta, Story } from '@storybook/react';
import { DateTime } from 'luxon';
import { withDesign } from 'storybook-addon-designs';
import { gqlMock } from '__tests__/util/graphqlMocking';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import { ContactRow } from './ContactRow';
import {
  ContactRowFragment,
  ContactRowFragmentDoc,
} from './ContactRow.generated';

export default {
  title: 'Contacts/ContactRow',
  component: ContactRow,
  decorators: [withDesign],
} as Meta;

export const Default: Story = () => {
  const contact = gqlMock<ContactRowFragment>(ContactRowFragmentDoc, {
    mocks: {
      primaryAddress: { updatedAt: DateTime.now().toISO() },
      pledgeCurrency: 'USD',
    },
  });

  return (
    <ContactsWrapper>
      <ContactRow contact={contact} />
    </ContactsWrapper>
  );
};

Default.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/zvqkcHImucOoPyXrYNqrkn/MPDX-Update-Material-UI?node-id=168%3A17154',
  },
};
