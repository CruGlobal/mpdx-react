import React, { ReactElement } from 'react';
import { ContactsHeader } from './ContactsHeader';

export default {
  title: 'Contacts/ContactHeaders',
};

export const Default = (): ReactElement => {
  return (
    <ContactsHeader
      activeFilters={false}
      filterPanelOpen={false}
      toggleFilterPanel={() => {}}
    />
  );
};
