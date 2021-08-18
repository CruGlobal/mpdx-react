import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CircularProgress, Divider, styled } from '@material-ui/core';
import { AccountsListHeader as Header } from '../AccountsListLayout/Header/Header';
import { AccountsList as List } from '../AccountsListLayout/List/List';
import type { Account } from '../AccountsListLayout/List/ListItem/ListItem';
import { useFinancialAccountsQuery } from './GetFinancialAccounts.generated';
import type {
  FinancialAccountsGroup,
  PreFinancialAccountsGroup,
} from './ResponsibilityCentersReport.type';
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
      const preFinancialAccountsGroup = data.financialAccounts.edges.reduce<PreFinancialAccountsGroup>(
        (obj, item) => {
          return {
            ...obj,
            [item.node?.organization?.name ?? '']: [
              ...(obj[item.node?.organization?.name ?? ''] || []),
              item.node,
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

  const handleCheckToggle = () => {
    return;
  };

  const totalBalance = useMemo(() => {
    return financialAccountsGroups
      ?.flatMap((financialAccountsGroup) => [
        ...financialAccountsGroup.financialAccounts,
      ])
      .filter((financialAccount) => financialAccount?.active)
      .reduce(
        (total, financialAccount) =>
          total + (financialAccount?.balance?.convertedAmount ?? 0),
        0,
      );
  }, [financialAccountsGroups]);

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
      ) : data?.financialAccounts.edges.length === 0 ? (
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
                balance: account?.balance.convertedAmount,
                code: account?.code,
                currency: account?.balance.convertedCurrency,
                id: account?.id,
                lastSyncDate: account?.balance.conversionDate,
                name: account?.name,
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
