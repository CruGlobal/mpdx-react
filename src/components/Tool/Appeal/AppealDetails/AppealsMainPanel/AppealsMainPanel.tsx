import React from 'react';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { DynamicContactsList } from '../../List/ContactsList/DynamicContactsList';
import { AppealsMainPanelHeader } from './AppealsMainPanelHeader';
import { useAppealQuery } from './appealInfo.generated';

export const AppealsMainPanel: React.FC = () => {
  const { accountListId, appealId, viewMode, userOptionsLoading } =
    React.useContext(AppealsContext) as AppealsType;

  const { data: appealInfo, loading: appealInfoLoading } = useAppealQuery({
    variables: {
      accountListId: accountListId ?? '',
      appealId: appealId ?? '',
    },
    skip: !accountListId || !appealId,
  });

  return (
    <>
      <AppealsMainPanelHeader />
      {!userOptionsLoading &&
        (viewMode === TableViewModeEnum.List ? (
          <DynamicContactsList
            appealInfo={appealInfo}
            appealInfoLoading={appealInfoLoading}
          />
        ) : (
          <p>Flows</p>
        ))}
    </>
  );
};
