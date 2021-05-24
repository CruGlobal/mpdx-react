import React from 'react';
import { Story, Meta } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';
import { SearchBox } from './SearchBox';

export default {
  title: 'SearchBox',
  component: SearchBox,
  argTypes: { onChange: { action: 'search box changed' } },
  decorators: [withDesign],
} as Meta;

export const Default: Story = (args) => {
  return (
    <SearchBox
      onChange={(searchTerm) => {
        args.onChange(searchTerm);
      }}
    />
  );
};

Default.parameters = {
  design: {
    type: 'figma',
    url:
      'https://www.figma.com/file/zvqkcHImucOoPyXrYNqrkn/MPDX-Update-Material-UI?node-id=631%3A3879',
  },
};
