import React from 'react';
import {
  ContactsContext,
  ContactsType,
} from '../../../../pages/accountLists/[accountListId]/contacts/ContactsContext';
import { FilterPanel } from '../../Shared/Filters/FilterPanel';
import { TableViewModeEnum } from '../../Shared/Header/ListHeader';
import { ContactsMapPanel } from '../ContactsMap/ContactsMapPanel';

export const ContactsLeftPanel: React.FC = () => {
  const {
    filterData,
    filtersLoading,
    savedFilters,
    activeFilters,
    toggleFilterPanel,
    setActiveFilters,
    mapData,
    panTo,
    selected,
    setSelected,
    viewMode,
  } = React.useContext(ContactsContext) as ContactsType;

  return viewMode === TableViewModeEnum.Map ? (
    <ContactsMapPanel
      data={mapData}
      panTo={panTo}
      selected={selected}
      setSelected={setSelected}
      onClose={toggleFilterPanel}
    />
  ) : filterData && !filtersLoading ? (
    <FilterPanel
      filters={filterData?.accountList?.contactFilterGroups}
      savedFilters={savedFilters}
      selectedFilters={activeFilters}
      onClose={toggleFilterPanel}
      onSelectedFiltersChanged={setActiveFilters}
    />
  ) : null;
};
