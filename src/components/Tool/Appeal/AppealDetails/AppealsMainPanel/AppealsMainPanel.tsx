import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
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
  const { push } = useRouter();
  const { enqueueSnackbar } = useSnackbar();
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
    // The appeal may have already been deleted (a stale link, a race with
    // another tab, ...). This component redirects on that itself below, so
    // only the expected NOT_FOUND code should skip the global toast/report -
    // any other error still toasts and reaches monitoring as usual.
    context: { suppressErrorCodes: ['NOT_FOUND'] },
  });

  useEffect(() => {
    if (!appealInfoError) {
      return;
    }
    enqueueSnackbar(
      t('That appeal could not be found. It may have already been deleted.'),
      { variant: 'error' },
    );
    push(`/accountLists/${accountListId}/tools/appeals`);
    // Only re-run when the error itself changes; push/enqueueSnackbar/t are
    // stable enough here and accountListId doesn't change once this page has
    // mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appealInfoError]);

  if (appealInfoError) {
    // Redirecting away; render nothing rather than a broken appeal page.
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
