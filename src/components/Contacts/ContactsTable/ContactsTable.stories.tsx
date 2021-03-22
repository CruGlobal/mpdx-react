import React, { ReactElement } from 'react';
import { ContactsTable } from './ContactsTable';

export default {
  title: 'ContactsTable',
};

const accountListId = '111';

export const Default = (): ReactElement => {
  return <ContactsTable accountListId={accountListId} />;
};

export const Loading = (): ReactElement => {
  return <ContactsTable accountListId={accountListId} />;
};

export const WithData = (): ReactElement => {
  return <ContactsTable accountListId={accountListId} />;
};

Default.story = {
  parameters: {
    chromatic: { delay: 1000 },
  },
};
