import _ from 'lodash';
import React from 'react';
import { ContactsMapPanel } from '../ContactsMap/ContactsMapPanel';
import {
  ContactsContext,
  ContactsType,
} from '../../../../pages/accountLists/[accountListId]/contacts/ContactsContext';
import { FilterPanel } from '../../../../src/components/Shared/Filters/FilterPanel';
import { TableViewModeEnum } from '../../../../src/components/Shared/Header/ListHeader';

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

  return (
    <>
      {viewMode !== TableViewModeEnum.Map ? (
        filterData && !filtersLoading ? (
          <FilterPanel
            filters={filterData?.accountList?.contactFilterGroups}
            savedFilters={savedFilters}
            selectedFilters={activeFilters}
            onClose={toggleFilterPanel}
            onSelectedFiltersChanged={setActiveFilters}
          />
        ) : (
          <></>
        )
      ) : (
        <ContactsMapPanel
          data={mapData}
          panTo={panTo}
          selected={selected}
          setSelected={setSelected}
          onClose={toggleFilterPanel}
        />
      )}
    </>
  );
};
