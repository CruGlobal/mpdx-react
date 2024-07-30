import React from 'react';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';

export const AppealsLeftPanel: React.FC = () => {
  const { filterData, filtersLoading, viewMode } = React.useContext(
    AppealsContext,
  ) as AppealsType;

  return viewMode !== TableViewModeEnum.Flows ? (
    <p>List Filters</p>
  ) : filterData && !filtersLoading ? (
    <p>Flows Filters</p>
  ) : null;
};
