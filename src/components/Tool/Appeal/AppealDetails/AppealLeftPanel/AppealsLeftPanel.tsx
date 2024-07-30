import React from 'react';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { DynamicAppealsListFilterPanel } from '../../List/AppealsListFilterPanel/DynamicAppealsListFilterPanel';

export const AppealsLeftPanel: React.FC = () => {
  const { filterData, filtersLoading, toggleFilterPanel, viewMode } =
    React.useContext(AppealsContext) as AppealsType;

  return viewMode !== TableViewModeEnum.Flows ? (
    <DynamicAppealsListFilterPanel onClose={toggleFilterPanel} />
  ) : filterData && !filtersLoading ? (
    <p>Flows Filters</p>
  ) : null;
};
