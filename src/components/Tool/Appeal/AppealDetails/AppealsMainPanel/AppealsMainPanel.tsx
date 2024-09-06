import React from 'react';
import { TableViewModeEnum } from 'src/components/Shared/Header/ListHeader';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { DynamicContactFlow } from '../../Flow/DynamicContactFlow';
import { DynamicContactsList } from '../../List/ContactsList/DynamicContactsList';
import { useAppealQuery } from './AppealInfo.generated';
import { AppealsMainPanelHeader } from './AppealsMainPanelHeader';

export const AppealsMainPanel: React.FC = () => {
  const {
    accountListId,
    appealId,
    searchTerm,
    setContactFocus,
    viewMode,
    userOptionsLoading,
  } = React.useContext(AppealsContext) as AppealsType;

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
          <DynamicContactFlow
            accountListId={accountListId ?? ''}
            searchTerm={searchTerm}
            onContactSelected={setContactFocus}
            appealInfo={appealInfo}
            appealInfoLoading={appealInfoLoading}
          />
        ))}
    </>
  );
};
