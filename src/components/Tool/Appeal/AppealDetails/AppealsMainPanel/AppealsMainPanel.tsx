import React from 'react';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { AppealsMainPanelHeader } from './AppealsMainPanelHeader';

export const AppealsMainPanel: React.FC = () => {
  const { viewMode, userOptionsLoading } = React.useContext(
    AppealsContext,
  ) as AppealsType;

  return (
    <>
      <AppealsMainPanelHeader />
      {!userOptionsLoading &&
        (viewMode === TableViewModeEnum.List ? <p>List</p> : <p>Flows</p>)}
    </>
  );
};
