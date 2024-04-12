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
      headerCheckboxState={ListHeaderCheckBoxState.Unchecked}
      filterPanelOpen={false}
      contactDetailsOpen={false}
      toggleFilterPanel={() => {}}
      onCheckAllItems={() => {}}
      onSearchTermChanged={() => {}}
      selectedIds={[]}
    />
  );
};

export const Task = (): ReactElement => {
  return (
    <ListHeader
      page="task"
      activeFilters={false}
      headerCheckboxState={ListHeaderCheckBoxState.Unchecked}
      starredFilter={{}}
      toggleStarredFilter={() => {}}
      filterPanelOpen={false}
      contactDetailsOpen={false}
      toggleFilterPanel={() => {}}
      onCheckAllItems={() => {}}
      onSearchTermChanged={() => {}}
      selectedIds={[]}
    />
  );
};

export const ActiveFilters = (): ReactElement => {
  return (
    <ListHeader
      page="contact"
      activeFilters={true}
      headerCheckboxState={ListHeaderCheckBoxState.Unchecked}
      starredFilter={{}}
      toggleStarredFilter={() => {}}
      filterPanelOpen={false}
      contactDetailsOpen={false}
      toggleFilterPanel={() => {}}
      onCheckAllItems={() => {}}
      onSearchTermChanged={() => {}}
      selectedIds={[]}
    />
  );
};

export const FilterPanelOpen = (): ReactElement => {
  return (
    <ListHeader
      page="contact"
      activeFilters={false}
      headerCheckboxState={ListHeaderCheckBoxState.Unchecked}
      starredFilter={{}}
      toggleStarredFilter={() => {}}
      filterPanelOpen={true}
      contactDetailsOpen={false}
      toggleFilterPanel={() => {}}
      onCheckAllItems={() => {}}
      onSearchTermChanged={() => {}}
      selectedIds={[]}
    />
  );
};

export const ActiveFiltersAndFilterPanelOpen = (): ReactElement => {
  return (
    <ListHeader
      page="contact"
      activeFilters={true}
      headerCheckboxState={ListHeaderCheckBoxState.Unchecked}
      starredFilter={{}}
      toggleStarredFilter={() => {}}
      filterPanelOpen={true}
      contactDetailsOpen={false}
      toggleFilterPanel={() => {}}
      onCheckAllItems={() => {}}
      onSearchTermChanged={() => {}}
      selectedIds={[]}
    />
  );
};
