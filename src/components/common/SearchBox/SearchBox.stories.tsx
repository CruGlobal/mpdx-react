import React from 'react';
import { Meta, Story } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';
import { SearchBox } from './SearchBox';

export default {
  title: 'SearchBox',
  component: SearchBox,
  args: {
    showContactSearchIcon: true,
  },
  argTypes: {
    onChange: { action: 'search box changed' },
    showContactSearchIcon: {
      name: 'showContactSearchIcon',
      options: [true, false],
      control: { type: 'radio' },
    },
  },
  decorators: [withDesign],
} as Meta;

export const Default: Story = (args) => {
  return (
    <SearchBox
      showContactSearchIcon={args.showContactSearchIcon}
      onChange={(searchTerm) => {
        args.onChange(searchTerm);
      }}
    />
  );
};

Default.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/zvqkcHImucOoPyXrYNqrkn/MPDX-Update-Material-UI?node-id=631%3A3879',
  },
};
