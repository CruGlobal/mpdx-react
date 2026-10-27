import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { asPath, push } = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const client = useApolloClient();
  const { accountListId, appealId, viewMode } = React.useContext(
    AppealsContext,
  ) as AppealsType;

  const {
    data: appealInfo,
    loading: appealInfoLoading,
    error: appealInfoError,
  } = useAppealQuery({
    variables: {
      accountListId,
      appealId: appealId ?? '',
    },
    skip: !appealId,
    context: { suppressErrorCodes: ['NOT_FOUND'] },
  });
  const appealNotFound = !!appealInfoError?.graphQLErrors.some(
    ({ extensions }) => extensions?.code === 'NOT_FOUND',
  );

  useEffect(() => {
    if (appealNotFound) {
      client.cache.evict({ id: `Appeal:${appealId}` });
      client.cache.gc();
      enqueueSnackbar(
        t('That appeal could not be found. It may have already been deleted.'),
        { variant: 'error' },
      );
    }
  }, [appealNotFound]);

  useEffect(() => {
    if (appealNotFound) {
      push(`/accountLists/${accountListId}/tools/appeals`);
    }
  }, [appealNotFound, asPath]);

  if (appealNotFound) {
    return null;
  }

  return (
    <>
      <AppealsMainPanelHeader />
      {viewMode === TableViewModeEnum.List ? (
        <DynamicContactsList
          appealInfo={appealInfo}
          appealInfoLoading={appealInfoLoading}
        />
      ) : viewMode === TableViewModeEnum.Flows ? (
        <DynamicContactFlow
          accountListId={accountListId}
          appealInfo={appealInfo}
          appealInfoLoading={appealInfoLoading}
        />
      ) : null}
    </>
  );
};
