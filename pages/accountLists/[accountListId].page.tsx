import Head from 'next/head';
import React, { ReactElement, useEffect, useState } from 'react';
import { ApolloError } from '@apollo/client';
import {
  GetDefaultAccountDocument,
  GetDefaultAccountQuery,
} from 'pages/api/getDefaultAccount.generated';
import { makeGetServerSideProps } from 'pages/api/utils/pagePropsHelpers';
import { logErrorOnRollbar } from 'pages/api/utils/rollBar';
import Dashboard from 'src/components/Dashboard';
import {
  AddMenuItemsEnum,
  renderDialog,
} from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/AddMenu';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import useTaskModal from 'src/hooks/useTaskModal';
import {
  isAccountListNotFoundError,
  replaceUrlAccountList,
} from 'src/lib/apollo/accountListRedirect';
import makeSsrClient from 'src/lib/apollo/ssrClient';
import { suggestArticles } from 'src/lib/helpScout';
import {
  GetDashboardDocument,
  GetDashboardQuery,
  GetDashboardQueryVariables,
} from './GetDashboard.generated';

export interface AccountListIdPageProps {
  data: GetDashboardQuery;
  modal: string;
}

const AccountListIdPage = ({
  data,
  modal,
}: AccountListIdPageProps): ReactElement => {
  const { appName } = useGetAppSettings();
  const { openTaskModal } = useTaskModal();
  const [selectedMenuItem, setSelectedMenuItem] =
    useState<AddMenuItemsEnum | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    suggestArticles('HS_HOME_SUGGESTIONS');
  }, []);

  useEffect(() => {
    if (!modal || dialogOpen) {
      return;
    }
    switch (modal) {
      case 'AddContact':
        setSelectedMenuItem(AddMenuItemsEnum.NewContact);
        setDialogOpen(true);
        break;
      case 'AddMultipleContacts':
        setSelectedMenuItem(AddMenuItemsEnum.MultipleContacts);
        setDialogOpen(true);
        break;
      case 'AddDonation':
        setSelectedMenuItem(AddMenuItemsEnum.AddDonation);
        setDialogOpen(true);
        break;
      case 'AddTask':
        openTaskModal({ view: TaskModalEnum.Add });
        break;
      case 'AddLogTask':
        openTaskModal({ view: TaskModalEnum.Log });
        break;
    }
  }, [modal]);

  return (
    <>
      <Head>
        <title>
          {appName} | {data.accountList.name}
        </title>
      </Head>
      <Dashboard data={data} accountListId={data.accountList.id} />

      {modal && renderDialog(selectedMenuItem, dialogOpen, setDialogOpen)}
    </>
  );
};

export const getServerSideProps = makeGetServerSideProps(
  async (session, { query, req }) => {
    const ssrClient = makeSsrClient(session.user.apiToken);

    try {
      if (typeof query.accountListId !== 'string') {
        throw new Error('Invalid accountListId');
      }

      const { data } = await ssrClient.query<
        GetDashboardQuery,
        GetDashboardQueryVariables
      >({
        query: GetDashboardDocument,
        variables: {
          accountListId: query.accountListId,
          // TODO: implement these variables in query
          // endOfDay: DateTime.local().endOf('day').toISO(),
          // today: DateTime.local().endOf('day').toISODate(),
          // twoWeeksFromNow: DateTime.local()
          //   .endOf('day')
          //   .plus({ weeks: 2 })
          //   .toISODate(),
        },
      });

      return {
        props: {
          data,
          modal: query?.modal?.toString() ?? '',
        },
      };
    } catch (error) {
      logErrorOnRollbar(error, '/accountLists/[accountListId].page');

      // Redirect to the account lists page if the error is anything except an
      // account list not found error
      const nonAccountListError =
        error instanceof ApolloError &&
        error.graphQLErrors.every(
          (error) => !isAccountListNotFoundError(error),
        );
      if (!req.url || nonAccountListError) {
        return {
          redirect: {
            destination: '/',
            permanent: false,
          },
        };
      }

      try {
        // Redirect to the default account list
        const { data } = await ssrClient.query<GetDefaultAccountQuery>({
          query: GetDefaultAccountDocument,
        });
        return {
          redirect: {
            destination: replaceUrlAccountList(
              req.url,
              data.user.defaultAccountList,
            ),
            permanent: false,
          },
        };
      } catch (error) {
        logErrorOnRollbar(error, '/accountLists/[accountListId].page');
        return {
          redirect: {
            destination: '/accountLists',
            permanent: false,
          },
        };
      }
    }
  },
);

export default AccountListIdPage;
