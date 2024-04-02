import React from 'react';
import { DynamicFilterPanel } from 'src/components/Shared/Filters/DynamicFilterPanel';
import { TableViewModeEnum } from '../../Shared/Header/ListHeader';
import {
  ContactsContext,
  ContactsType,
} from '../ContactsContext/ContactsContext';
import { DynamicContactsMapPanel } from '../ContactsMap/DynamicContactsMapPanel';

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
    <DynamicContactsMapPanel
      data={mapData}
      panTo={panTo}
      selected={selected}
      setSelected={setSelected}
      onClose={toggleFilterPanel}
    />
  ) : filterData && !filtersLoading ? (
    <DynamicFilterPanel
      filters={filterData?.accountList?.contactFilterGroups}
      savedFilters={savedFilters}
      selectedFilters={activeFilters}
      onClose={toggleFilterPanel}
      onSelectedFiltersChanged={setActiveFilters}
    />
  ) : null;
};
