import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CircularProgress, Divider, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { currencyFormat } from 'src/lib/intlFormat';
import { useLocale } from 'src/hooks/useLocale';
import { useDesignationAccountsQuery } from './GetDesignationAccounts.generated';
import { useSetActiveDesignationAccountMutation } from './SetActiveDesignationAccount.generated';
import {
  MultiPageHeader,
  HeaderTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { Notification } from 'src/components/Notification/Notification';
import { EmptyReport } from 'src/components/Reports/EmptyReport/EmptyReport';
import type { Account } from '../AccountsListLayout/List/ListItem/ListItem';
import { AccountsList as List } from '../AccountsListLayout/List/List';

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

export const DesignationAccountsReport: React.FC<Props> = ({
  accountListId,
  isNavListOpen,
  onNavListToggle,
  title,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const { data, loading, error } = useDesignationAccountsQuery({
    variables: {
      accountListId,
    },
  });

  const [setActiveDesignationAccount] =
    useSetActiveDesignationAccountMutation();

  const handleCheckToggle = (
    event: React.ChangeEvent<HTMLInputElement>,
    accountId: string,
  ) => {
    setActiveDesignationAccount({
      variables: {
        input: {
          accountListId,
          active: event.target.checked,
          designationAccountId: accountId,
        },
      },
      optimisticResponse: {
        setActiveDesignationAccount: {
          id: accountId,
          active: event.target.checked,
          __typename: 'DesignationAccountRest',
        },
      },
    });
  };

  const totalBalance = useMemo(() => {
    return data?.designationAccounts[0]?.designationAccounts
      .filter((designationAccount) => designationAccount.active)
      .reduce(
        (total, designationAccount) =>
          total + designationAccount.convertedBalance,
        0,
      );
  }, [data?.designationAccounts]);

  const balanceNode =
    totalBalance && totalBalance > 0 ? (
      <Typography variant="h6">{`${t('Balance')}: ${currencyFormat(
        totalBalance,
        data?.designationAccounts[0].designationAccounts[0].currency,
        locale,
      )}`}</Typography>
    ) : undefined;

  return (
    <Box>
      <MultiPageHeader
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        title={title}
        rightExtra={balanceNode}
        headerType={HeaderTypeEnum.Report}
      />
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress data-testid="LoadingDesignationAccounts" />
        </Box>
      ) : error ? (
        <Notification type="error" message={error.toString()} />
      ) : data?.designationAccounts.length === 0 ? (
        <EmptyReport
          hasAddNewDonation={false}
          title={t('You have no designation accounts')}
          subTitle={t(
            'You can setup an organization account to import your designation accounts.',
          )}
        />
      ) : (
        <ScrollBox data-testid="DesignationAccountsScrollBox">
          <Divider />
          {data?.designationAccounts.map((designationAccountGroup) => {
            const accounts: Account[] =
              designationAccountGroup.designationAccounts.map((account) => ({
                active: account.active,
                balance: account.convertedBalance,
                code: account.designationNumber ?? undefined,
                currency: account.currency,
                id: account.id,
                lastSyncDate: account.balanceUpdatedAt,
                name: account.name,
              }));

            return (
              <List
                key={designationAccountGroup.organizationName}
                accounts={accounts}
                organizationName={designationAccountGroup.organizationName}
                onCheckToggle={handleCheckToggle}
              />
            );
          })}
        </ScrollBox>
      )}
    </Box>
  );
};
