import React, { ReactElement } from 'react';
import { Header, HeaderCheckBoxState } from './Header';

export default {
  title: 'Shared/Header',
};

export const Default = (): ReactElement => {
  return (
    <Header
      page="contact"
      activeFilters={false}
      headerCheckboxState={HeaderCheckBoxState.unchecked}
      filterPanelOpen={false}
      toggleFilterPanel={() => {}}
      onCheckAllItems={() => {}}
      onSearchTermChanged={() => {}}
    />
  );
};

export const Task = (): ReactElement => {
  return (
    <Header
      page="task"
      activeFilters={false}
      headerCheckboxState={HeaderCheckBoxState.unchecked}
      filterPanelOpen={false}
      toggleFilterPanel={() => {}}
      onCheckAllItems={() => {}}
      onSearchTermChanged={() => {}}
    />
  );
};

export const ActiveFilters = (): ReactElement => {
  return (
    <Header
      page="contact"
      activeFilters={true}
      headerCheckboxState={HeaderCheckBoxState.unchecked}
      filterPanelOpen={false}
      toggleFilterPanel={() => {}}
      onCheckAllItems={() => {}}
      onSearchTermChanged={() => {}}
    />
  );
};

export const FilterPanelOpen = (): ReactElement => {
  return (
    <Header
      page="contact"
      activeFilters={false}
      headerCheckboxState={HeaderCheckBoxState.unchecked}
      filterPanelOpen={true}
      toggleFilterPanel={() => {}}
      onCheckAllItems={() => {}}
      onSearchTermChanged={() => {}}
    />
  );
};

export const ActiveFiltersAndFilterPanelOpen = (): ReactElement => {
  return (
    <Header
      page="contact"
      activeFilters={true}
      headerCheckboxState={HeaderCheckBoxState.unchecked}
      filterPanelOpen={true}
      toggleFilterPanel={() => {}}
      onCheckAllItems={() => {}}
      onSearchTermChanged={() => {}}
    />
  );
};
