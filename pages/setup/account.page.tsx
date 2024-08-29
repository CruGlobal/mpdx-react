import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { getSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import {
  UpdateUserDefaultAccountDocument,
  UpdateUserDefaultAccountMutation,
  UpdateUserDefaultAccountMutationVariables,
  useUpdateUserDefaultAccountMutation,
} from 'src/components/Settings/preferences/accordions/DefaultAccountAccordion/UpdateDefaultAccount.generated';
import { SetupPage } from 'src/components/Setup/SetupPage';
import { LargeButton } from 'src/components/Setup/styledComponents';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import makeSsrClient from 'src/lib/apollo/ssrClient';
import {
  AccountListOptionsDocument,
  AccountListOptionsQuery,
} from './Account.generated';

type AccountList = AccountListOptionsQuery['accountLists']['nodes'][number];

interface PageProps {
  accountListOptions: AccountListOptionsQuery;
}

// This is the third page page of the setup tour. It lets users choose their
// default account list. It will be shown if the user has more than one account
// list and don't have a default chosen yet.
const AccountPage: React.FC<PageProps> = ({ accountListOptions }) => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const { push } = useRouter();
  const [updateUserDefaultAccount, { loading: isSubmitting }] =
    useUpdateUserDefaultAccountMutation();

  const [defaultAccountList, setDefaultAccountList] =
    useState<AccountList | null>(null);

  const handleSave = async () => {
    if (!defaultAccountList) {
      return;
    }

    await updateUserDefaultAccount({
      variables: {
        input: {
          attributes: {
            defaultAccountList: defaultAccountList.id,
          },
        },
      },
    });
    push(`/accountLists/${defaultAccountList.id}/settings/preferences`);
  };

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Setup - Default Account')}
        </title>
      </Head>
      <SetupPage title={t('Set default account')}>
        {t(
          'Which account would you like to see by default when you open {{appName}}?',
          { appName },
        )}
        <Autocomplete
          autoHighlight
          value={defaultAccountList}
          onChange={(_, value) => setDefaultAccountList(value)}
          options={accountListOptions.accountLists.nodes}
          getOptionLabel={(accountList) => accountList.name ?? ''}
          fullWidth
          renderInput={(params) => (
            <TextField {...params} label={t('Account')} />
          )}
        />
        <LargeButton
          variant="contained"
          fullWidth
          onClick={handleSave}
          disabled={!defaultAccountList || isSubmitting}
        >
          {t('Continue Tour')}
        </LargeButton>
      </SetupPage>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context,
) => {
  const session = await getSession(context);
  const apiToken = session?.user?.apiToken;
  if (!apiToken) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const ssrClient = makeSsrClient(apiToken);
  const { data: accountListOptions } =
    await ssrClient.query<AccountListOptionsQuery>({
      query: AccountListOptionsDocument,
    });

  if (accountListOptions.accountLists.nodes.length === 1) {
    // The user has exactly one account list, so set it as the default and go to preferences
    const defaultAccountListId = accountListOptions.accountLists.nodes[0].id;
    await ssrClient.mutate<
      UpdateUserDefaultAccountMutation,
      UpdateUserDefaultAccountMutationVariables
    >({
      mutation: UpdateUserDefaultAccountDocument,
      variables: {
        input: {
          attributes: {
            defaultAccountList: defaultAccountListId,
          },
        },
      },
    });
    return {
      redirect: {
        destination: `/accountLists/${defaultAccountListId}/settings/preferences`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
      accountListOptions,
    },
  };
};

export default AccountPage;
