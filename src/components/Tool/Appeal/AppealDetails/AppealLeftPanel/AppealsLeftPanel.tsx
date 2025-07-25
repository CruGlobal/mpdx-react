import React from 'react';
import { DynamicFilterPanel } from 'src/components/Shared/Filters/DynamicFilterPanel';
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
    toggleFilterPanel,
    viewMode,
  } = React.useContext(AppealsContext) as AppealsType;

  return viewMode !== TableViewModeEnum.Flows ? (
    <DynamicAppealsListFilterPanel onClose={toggleFilterPanel} />
  ) : filterData && !filtersLoading ? (
    <DynamicFilterPanel
      filters={filterData?.accountList?.contactFilterGroups}
      savedFilters={savedFilters}
      onClose={toggleFilterPanel}
    />
  ) : null;
};
