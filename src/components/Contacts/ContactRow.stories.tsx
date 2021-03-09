import React from 'react';
import { Story, Meta } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';
import { ContactRow } from './ContactRow';
import { ContactRowFragment } from './ContactRow.generated';

export default {
  title: 'Contacts/ContactRow',
  component: ContactRow,
  decorators: [withDesign],
} as Meta;

export const Default: Story = () => {
  return (
    <ContactRow contact={{ name: 'Contact Name' } as ContactRowFragment} />
  );
};

Default.parameters = {
  design: {
    type: 'figma',
    url:
      'https://www.figma.com/file/zvqkcHImucOoPyXrYNqrkn/MPDX-Update-Material-UI?node-id=168%3A17154',
  },
};
