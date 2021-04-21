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

export const ActiveFilters = (): ReactElement => {
  return (
    <ContactsHeader
      activeFilters={true}
      filterPanelOpen={false}
      toggleFilterPanel={() => {}}
    />
  );
};

export const FilterPanelOpen = (): ReactElement => {
  return (
    <ContactsHeader
      activeFilters={false}
      filterPanelOpen={true}
      toggleFilterPanel={() => {}}
    />
  );
};

export const ActiveFiltersAndFilterPanelOpen = (): ReactElement => {
  return (
    <ContactsHeader
      activeFilters={true}
      filterPanelOpen={true}
      toggleFilterPanel={() => {}}
    />
  );
};
