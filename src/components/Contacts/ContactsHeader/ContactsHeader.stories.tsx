import React, { ReactElement } from 'react';
import { ContactsHeader } from './ContactsHeader';

export default {
  title: 'ContactHeaders',
};

export const Default = (): ReactElement => {
  return <ContactsHeader />;
};

Default.story = {
  parameters: {
    chromatic: { delay: 1000 },
  },
};
