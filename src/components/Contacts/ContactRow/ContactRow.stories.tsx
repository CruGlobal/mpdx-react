import React from 'react';
import { Story, Meta } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';

import { gqlMock } from '../../../../__tests__/util/graphqlMocking';
import { ContactRow } from './ContactRow';
import {
  ContactRowFragment,
  ContactRowFragmentDoc,
} from './ContactRow.generated';
import { ContactsPageProvider } from 'pages/accountLists/[accountListId]/contacts/ContactsPageContext';

export default {
  title: 'Contacts/ContactRow',
  component: ContactRow,
  decorators: [withDesign],
} as Meta;

export const Default: Story = () => {
  const contact = gqlMock<ContactRowFragment>(ContactRowFragmentDoc);

  return (
    <ContactsPageProvider>
      <ContactRow contact={contact} />
    </ContactsPageProvider>
  );
};

Default.parameters = {
  design: {
    type: 'figma',
    url:
      'https://www.figma.com/file/zvqkcHImucOoPyXrYNqrkn/MPDX-Update-Material-UI?node-id=168%3A17154',
  },
};
