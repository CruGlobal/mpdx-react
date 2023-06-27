import React from 'react';
import { Story, Meta } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';

import { DateTime } from 'luxon';
import { gqlMock } from '../../../../__tests__/util/graphqlMocking';
import { ContactRow } from './ContactRow';
import {
  ContactRowFragment,
  ContactRowFragmentDoc,
} from './ContactRow.generated';
import { ContactsPage } from 'pages/accountLists/[accountListId]/contacts/ContactsPage';

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
    <ContactsPage>
      <ContactRow contact={contact} />
    </ContactsPage>
  );
};

Default.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/zvqkcHImucOoPyXrYNqrkn/MPDX-Update-Material-UI?node-id=168%3A17154',
  },
};
