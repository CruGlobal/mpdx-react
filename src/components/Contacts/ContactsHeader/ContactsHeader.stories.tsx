import React, { ReactElement } from 'react';
import ContactHeaders from './ContactsHeader';

export default {
  title: 'ContactHeaders',
};

export const Default = (): ReactElement => {
  return <ContactHeaders />;
};

Default.story = {
  parameters: {
    chromatic: { delay: 1000 },
  },
};
