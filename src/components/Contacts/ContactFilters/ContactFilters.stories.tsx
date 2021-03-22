import React, { ReactElement } from 'react';
import { ContactFilters } from './ContactFilters';

export default {
  title: 'ContactFilters',
};

const accountListId = '111';

export const Default = (): ReactElement => {
  return <ContactFilters accountListId={accountListId} />;
};

export const Loading = (): ReactElement => {
  return <ContactFilters accountListId={accountListId} />;
};

export const WithData = (): ReactElement => {
  return <ContactFilters accountListId={accountListId} />;
};

Default.story = {
  parameters: {
    chromatic: { delay: 1000 },
  },
};
