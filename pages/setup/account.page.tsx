import Head from 'next/head';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { makeGetServerSideProps } from 'pages/api/utils/pagePropsHelpers';
import { AccountListAutocomplete } from 'src/common/Autocompletes/AccountListAutocomplete';
import {
  UpdateUserDefaultAccountDocument,
  UpdateUserDefaultAccountMutation,
  UpdateUserDefaultAccountMutationVariables,
  useUpdateUserDefaultAccountMutation,
} from 'src/components/Settings/preferences/accordions/DefaultAccountAccordion/UpdateDefaultAccount.generated';
import { SetupPage } from 'src/components/Setup/SetupPage';
import { LargeButton } from 'src/components/Setup/styledComponents';
import { useNextSetupPage } from 'src/components/Setup/useNextSetupPage';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import makeSsrClient from 'src/lib/apollo/ssrClient';
import {
  AccountListOptionsDocument,
  AccountListOptionsQuery,
} from './Account.generated';

export type AccountList =
  AccountListOptionsQuery['accountLists']['nodes'][number];
interface PageProps {
  accountListOptions: AccountListOptionsQuery;
}

// This is the third page page of the setup tour. It lets users choose their
// default account list. It will be shown if the user has more than one account
// list and don't have a default chosen yet.
const AccountPage: React.FC<PageProps> = ({ accountListOptions }) => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const { next } = useNextSetupPage();
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
    await next();
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Setup - Default Account')}`}</title>
      </Head>
      <SetupPage title={t('Set default account')}>
        {t(
          'Which account would you like to see by default when you open {{appName}}?',
          { appName },
        )}
        <AccountListAutocomplete
          onChange={(_, value) => setDefaultAccountList(value)}
          value={defaultAccountList}
          options={accountListOptions?.accountLists.nodes}
          textFieldProps={{
            label: t('Account'),
          }}
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

export const getServerSideProps = makeGetServerSideProps<PageProps>(
  async (session) => {
    const ssrClient = makeSsrClient(session.user.apiToken);
    const { data: accountListOptions } =
      await ssrClient.query<AccountListOptionsQuery>({
        query: AccountListOptionsDocument,
      });

    if (accountListOptions.accountLists.nodes.length === 1) {
      // The user has exactly one account list, so set it as the default and go to preferences
      const defaultAccountList = accountListOptions.accountLists.nodes[0].id;
      try {
        await ssrClient.mutate<
          UpdateUserDefaultAccountMutation,
          UpdateUserDefaultAccountMutationVariables
        >({
          mutation: UpdateUserDefaultAccountDocument,
          variables: {
            input: {
              attributes: {
                defaultAccountList: defaultAccountList,
              },
            },
          },
        });
        return {
          redirect: {
            destination: `/accountLists/${defaultAccountList}/settings/preferences`,
            permanent: false,
          },
        };
      } catch {
        // If setting the account list failed, silently swallow the error and let
        // the user view the page. If the error is persistent, the mutation will
        // fail there when they try to choose a default account list, and they
        // will at least get an error message.
      }
    }

    return {
      props: {
        accountListOptions,
      },
    };
  },
);

export default AccountPage;
