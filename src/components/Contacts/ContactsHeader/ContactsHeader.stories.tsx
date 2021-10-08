import React, { ReactElement } from 'react';
import { ContactCheckBoxState, ContactsHeader } from './ContactsHeader';

export default {
  title: 'Contacts/ContactHeaders',
};

export const Default = (): ReactElement => {
  return (
    <ContactsHeader
      contactsTableDisplayState="list"
      onViewModeChange={() => {}}
      activeFilters={false}
      contactCheckboxState={ContactCheckBoxState.unchecked}
      filterPanelOpen={false}
      toggleFilterPanel={() => {}}
      onCheckAllContacts={() => {}}
      onSearchTermChanged={() => {}}
    />
  );
};

export const ActiveFilters = (): ReactElement => {
  return (
    <ContactsHeader
      contactsTableDisplayState="list"
      onViewModeChange={() => {}}
      activeFilters={true}
      contactCheckboxState={ContactCheckBoxState.unchecked}
      filterPanelOpen={false}
      toggleFilterPanel={() => {}}
      onCheckAllContacts={() => {}}
      onSearchTermChanged={() => {}}
    />
  );
};

export const FilterPanelOpen = (): ReactElement => {
  return (
    <ContactsHeader
      contactsTableDisplayState="list"
      onViewModeChange={() => {}}
      activeFilters={false}
      contactCheckboxState={ContactCheckBoxState.unchecked}
      filterPanelOpen={true}
      toggleFilterPanel={() => {}}
      onCheckAllContacts={() => {}}
      onSearchTermChanged={() => {}}
    />
  );
};

export const ActiveFiltersAndFilterPanelOpen = (): ReactElement => {
  return (
    <ContactsHeader
      contactsTableDisplayState="list"
      onViewModeChange={() => {}}
      activeFilters={true}
      contactCheckboxState={ContactCheckBoxState.unchecked}
      filterPanelOpen={true}
      toggleFilterPanel={() => {}}
      onCheckAllContacts={() => {}}
      onSearchTermChanged={() => {}}
    />
  );
};
