import React, { useMemo } from 'react';
import { Box, CircularProgress, Divider, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { Notification } from 'src/components/Notification/Notification';
import { EmptyReport } from 'src/components/Reports/EmptyReport/EmptyReport';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { AccountsList as List } from '../../AccountsListLayout/List/List';
import {
  FinancialAccountContext,
  FinancialAccountType,
} from '../Context/FinancialAccountsContext';
import {
  FinancialAccountsDocument,
  FinancialAccountsQuery,
  useEntryHistoriesQuery,
  useFinancialAccountsQuery,
  useSetActiveFinancialAccountMutation,
} from './FinancialAccounts.generated';
import type { Account } from '../../AccountsListLayout/List/ListItem/ListItem';
import type {
  FinancialAccountsGroup,
  PreFinancialAccountsGroup,
} from './FinancialAccounts.type';

const ScrollBox = styled(Box)(({}) => ({
  height: 'calc(100vh - 160px)',
  overflowY: 'auto',
}));

export const FinancialAccounts: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();

  const {
    accountListId,
    isNavListOpen,
    designationAccounts,
    handleNavListToggle,
  } = React.useContext(FinancialAccountContext) as FinancialAccountType;

  const financialAccountsQueryVariables = {
    accountListId,
    designationAccountIds: designationAccounts?.length
      ? designationAccounts
      : null,
  };

  const { data, error, fetchMore } = useFinancialAccountsQuery({
    variables: financialAccountsQueryVariables,
  });
  const { loading } = useFetchAllPages({
    pageInfo: data?.financialAccounts.pageInfo,
    fetchMore,
    error,
  });

  const financialAccountsGroups = useMemo(() => {
    if (data) {
      const preFinancialAccountsGroup =
        data.financialAccounts.nodes.reduce<PreFinancialAccountsGroup>(
          (obj, item) => {
            return {
              ...obj,
              [item?.organization?.name ?? '']: [
                ...(obj[item?.organization?.name ?? ''] || []),
                item,
              ],
            };
          },
          {},
        );
      const financialAccountsGroup: FinancialAccountsGroup[] = Object.entries(
        preFinancialAccountsGroup,
      ).map(([organizationName, financialAccounts]) => ({
        organizationName,
        financialAccounts: financialAccounts.sort((a, b) =>
          (a?.name ?? '').localeCompare(b?.name ?? ''),
        ),
      }));

      return financialAccountsGroup;
    }
  }, [data]);

  const [setActiveFinancialAccount] = useSetActiveFinancialAccountMutation();

  const handleCheckToggle = (
    event: React.ChangeEvent<HTMLInputElement>,
    accountId: string,
  ) => {
    setActiveFinancialAccount({
      variables: {
        input: {
          accountListId,
          active: event.target.checked,
          financialAccountId: accountId,
        },
      },
      optimisticResponse: {
        setActiveFinancialAccount: {
          id: accountId,
          active: event.target.checked,
          __typename: 'SetActiveFinancialAccountRest',
        },
      },
      update: (cache) => {
        const query = {
          query: FinancialAccountsDocument,
          variables: financialAccountsQueryVariables,
        };

        const dataFromCache = cache.readQuery<FinancialAccountsQuery>(query);

        const data = {
          financialAccounts: {
            ...dataFromCache?.financialAccounts,
            nodes: dataFromCache?.financialAccounts.nodes.map(
              (financialAccount) => ({
                ...financialAccount,
                active:
                  financialAccount.id === accountId
                    ? event.target.checked
                    : financialAccount.active,
              }),
            ),
          },
        };

        cache.writeQuery({ ...query, data });
      },
    });
  };

  const totalBalance = useMemo(() => {
    return financialAccountsGroups
      ?.flatMap((financialAccountsGroup) => [
        ...financialAccountsGroup.financialAccounts,
      ])
      .filter((financialAccount) => financialAccount?.active)
      .reduce(
        (total, financialAccount) =>
          total + -(financialAccount?.balance?.convertedAmount ?? 0),
        0,
      );
  }, [financialAccountsGroups]);

  const activeFinancialAccountIds: Array<string> = useMemo(() => {
    return (
      data?.financialAccounts.nodes
        .filter((financialAccount) => financialAccount.active)
        .map((activeFinancialAccount) => activeFinancialAccount.id) ?? []
    );
  }, [data]);

  const entryHistoriesResponse = useEntryHistoriesQuery({
    variables: {
      accountListId,
      financialAccountIds: activeFinancialAccountIds,
    },
    skip: !activeFinancialAccountIds.length,
  });

  const balanceNode =
    typeof totalBalance !== 'undefined' && financialAccountsGroups ? (
      <Typography variant="h6">{`${t('Balance')}: ${currencyFormat(
        totalBalance,
        financialAccountsGroups[0]?.financialAccounts[0]?.balance
          ?.convertedCurrency,
        locale,
      )}`}</Typography>
    ) : undefined;

  return (
    <Box>
      <MultiPageHeader
        isNavListOpen={isNavListOpen}
        onNavListToggle={handleNavListToggle}
        title={t('Responsibility Centers')}
        headerType={HeaderTypeEnum.Report}
        rightExtra={balanceNode}
      />
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress data-testid="LoadingFinancialAccounts" />
        </Box>
      ) : error ? (
        <Notification type="error" message={error.toString()} />
      ) : data?.financialAccounts.nodes.length === 0 ? (
        <EmptyReport
          hasAddNewDonation={false}
          title={t('You have no responsibility centers.')}
          subTitle={t(
            'You can setup an organization account to import your responsibility centers.',
          )}
        />
      ) : (
        <ScrollBox data-testid="FinancialAccountsScrollBox">
          <Divider />
          {financialAccountsGroups?.map((financialAccountGroup) => {
            const accounts: Account[] =
              financialAccountGroup.financialAccounts.map((account) => ({
                active: account?.active,
                balance: -(account?.balance.convertedAmount ?? 0),
                code: account?.code,
                currency: account?.balance.convertedCurrency ?? '',
                id: account?.id,
                lastSyncDate: account?.updatedAt,
                name: account?.name,
                entryHistories:
                  entryHistoriesResponse?.data?.entryHistories?.find(
                    (entryHistoriesGroup) =>
                      entryHistoriesGroup.financialAccountId === account?.id,
                  )?.entryHistories,
              }));

            return (
              <List
                key={financialAccountGroup.organizationName}
                organizationName={financialAccountGroup.organizationName}
                accounts={accounts}
                hasFinancial={true}
                onCheckToggle={handleCheckToggle}
              />
            );
          })}
        </ScrollBox>
      )}
    </Box>
  );
};
