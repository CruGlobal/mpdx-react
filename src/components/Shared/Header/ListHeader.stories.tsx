import React, { ReactElement } from 'react';
import { ListHeader, ListHeaderCheckBoxState } from './ListHeader';

export default {
  title: 'Shared/Header/ListHeader',
};

export const Default = (): ReactElement => {
  return (
    <ListHeader
      page="contact"
      activeFilters={false}
      starredFilter={{}}
      toggleStarredFilter={() => {}}
      headerCheckboxState={ListHeaderCheckBoxState.unchecked}
      filterPanelOpen={false}
      contactDetailsOpen={false}
      toggleFilterPanel={() => {}}
      onCheckAllItems={() => {}}
      onSearchTermChanged={() => {}}
    />
  );
};

export const Task = (): ReactElement => {
  return (
    <ListHeader
      page="task"
      activeFilters={false}
      headerCheckboxState={ListHeaderCheckBoxState.unchecked}
      starredFilter={{}}
      toggleStarredFilter={() => {}}
      filterPanelOpen={false}
      contactDetailsOpen={false}
      toggleFilterPanel={() => {}}
      onCheckAllItems={() => {}}
      onSearchTermChanged={() => {}}
    />
  );
};

export const ActiveFilters = (): ReactElement => {
  return (
    <ListHeader
      page="contact"
      activeFilters={true}
      headerCheckboxState={ListHeaderCheckBoxState.unchecked}
      starredFilter={{}}
      toggleStarredFilter={() => {}}
      filterPanelOpen={false}
      contactDetailsOpen={false}
      toggleFilterPanel={() => {}}
      onCheckAllItems={() => {}}
      onSearchTermChanged={() => {}}
    />
  );
};

export const FilterPanelOpen = (): ReactElement => {
  return (
    <ListHeader
      page="contact"
      activeFilters={false}
      headerCheckboxState={ListHeaderCheckBoxState.unchecked}
      starredFilter={{}}
      toggleStarredFilter={() => {}}
      filterPanelOpen={true}
      contactDetailsOpen={false}
      toggleFilterPanel={() => {}}
      onCheckAllItems={() => {}}
      onSearchTermChanged={() => {}}
    />
  );
};

export const ActiveFiltersAndFilterPanelOpen = (): ReactElement => {
  return (
    <ListHeader
      page="contact"
      activeFilters={true}
      headerCheckboxState={ListHeaderCheckBoxState.unchecked}
      starredFilter={{}}
      toggleStarredFilter={() => {}}
      filterPanelOpen={true}
      contactDetailsOpen={false}
      toggleFilterPanel={() => {}}
      onCheckAllItems={() => {}}
      onSearchTermChanged={() => {}}
    />
  );
};
