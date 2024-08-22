import React from 'react';
import { DynamicFilterPanel } from 'src/components/Shared/Filters/DynamicFilterPanel';
import { ContextTypesEnum } from 'src/components/Shared/Filters/FilterPanel';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { DynamicAppealsListFilterPanel } from '../../List/AppealsListFilterPanel/DynamicAppealsListFilterPanel';

export const AppealsLeftPanel: React.FC = () => {
  const {
    filterData,
    filtersLoading,
    savedFilters,
    activeFilters,
    toggleFilterPanel,
    setActiveFilters,
    viewMode,
  } = React.useContext(AppealsContext) as AppealsType;

  return viewMode !== TableViewModeEnum.Flows ? (
    <DynamicAppealsListFilterPanel onClose={toggleFilterPanel} />
  ) : filterData && !filtersLoading ? (
    <DynamicFilterPanel
      filters={filterData?.accountList?.contactFilterGroups}
      savedFilters={savedFilters}
      selectedFilters={activeFilters}
      onClose={toggleFilterPanel}
      onSelectedFiltersChanged={setActiveFilters}
      contextType={ContextTypesEnum.Appeals}
    />
  ) : null;
};
