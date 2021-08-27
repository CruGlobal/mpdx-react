import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CircularProgress, Divider, styled } from '@material-ui/core';
import { AccountsListHeader as Header } from '../AccountsListLayout/Header/Header';
import { AccountsList as List } from '../AccountsListLayout/List/List';
import type { Account } from '../AccountsListLayout/List/ListItem/ListItem';
import {
  FinancialAccountsDocument,
  FinancialAccountsQuery,
  useFinancialAccountsQuery,
} from './GetFinancialAccounts.generated';
import type {
  FinancialAccountsGroup,
  PreFinancialAccountsGroup,
} from './ResponsibilityCentersReport.type';
import { useSetActiveFinancialAccountMutation } from './SetActiveFinancialAccount.generated';
import { useEntryHistoriesQuery } from './GetEntryHistories.generated';
import { Notification } from 'src/components/Notification/Notification';
import { EmptyReport } from 'src/components/Reports/EmptyReport/EmptyReport';
import { currencyFormat } from 'src/lib/intlFormat';

interface Props {
  accountListId: string;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

const ScrollBox = styled(Box)(({}) => ({
  height: 'calc(100vh - 160px)',
  overflowY: 'auto',
}));

export const ResponsibilityCentersReport: React.FC<Props> = ({
  accountListId,
  isNavListOpen,
  onNavListToggle,
  title,
}) => {
  const { t } = useTranslation();

  const { data, loading, error } = useFinancialAccountsQuery({
    variables: {
      accountListId,
    },
  });

  const financialAccountsGroups = useMemo(() => {
    if (data) {
      const preFinancialAccountsGroup = data.financialAccounts.nodes.reduce<PreFinancialAccountsGroup>(
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
        financialAccounts,
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
          variables: {
            accountListId,
          },
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
  });

  return (
    <Box>
      <Header
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        title={title}
        totalBalance={
          totalBalance && totalBalance > 0 && financialAccountsGroups
            ? currencyFormat(
                totalBalance,
                financialAccountsGroups[0].financialAccounts[0]?.balance
                  .convertedCurrency,
              )
            : undefined
        }
      />
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress data-testid="LoadingResponsibilityCenters" />
        </Box>
      ) : error ? (
        <Notification type="error" message={error.toString()} />
      ) : data?.financialAccounts.nodes.length === 0 ? (
        <EmptyReport
          hasAddNewDonation={false}
          title={t('You have no financial accounts')}
          subTitle={t(
            'You can setup an organization account to import your financial accounts.',
          )}
        />
      ) : (
        <ScrollBox data-testid="ResponsibilityCentersScrollBox">
          <Divider />
          {financialAccountsGroups?.map((financialAccountGroup) => {
            const accounts: Account[] = financialAccountGroup.financialAccounts.map(
              (account) => ({
                active: account?.active,
                balance: -(account?.balance.convertedAmount ?? 0),
                code: account?.code,
                currency: account?.balance.convertedCurrency ?? '',
                id: account?.id,
                lastSyncDate: account?.balance.conversionDate,
                name: account?.name,
                entryHistories: entryHistoriesResponse?.data?.entryHistories?.find(
                  (entryHistoriesGroup) =>
                    entryHistoriesGroup.financialAccountId === account?.id,
                )?.entryHistories,
              }),
            );

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
