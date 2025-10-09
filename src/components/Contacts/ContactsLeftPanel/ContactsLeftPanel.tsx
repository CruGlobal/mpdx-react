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
    filters,
    filtersLoading,
    savedFilters,
    toggleFilterPanel,
    mapData,
    panTo,
    selected,
    setSelected,
    viewMode,
  } = React.useContext(ContactsContext) as ContactsType;

  console.log('render ContactsLeftPanel', filters);

  return viewMode === TableViewModeEnum.Map ? (
    <DynamicContactsMapPanel
      data={mapData}
      panTo={panTo}
      selected={selected}
      setSelected={setSelected}
      onClose={toggleFilterPanel}
    />
  ) : filters && !filtersLoading ? (
    <DynamicFilterPanel
      // filters={filterData?.accountList?.contactFilterGroups}
      filters={filters}
      savedFilters={savedFilters}
      onClose={toggleFilterPanel}
    />
  ) : null;
};
