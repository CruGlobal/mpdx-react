import React, { FC } from 'react';
import { List } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Account, AccountListItem as ListItem } from './ListItem/ListItem';
import { AccountListSubheader as ListSubheader } from './ListSubheader/ListSubheader';

export interface AccountsListProps {
  accounts: Account[];
  hasFinancial?: boolean;
  organizationName: string;
  onCheckToggle: (
    event: React.ChangeEvent<HTMLInputElement>,
    accountId: string,
  ) => void;
}

const AccountsGroupList = styled(List)(({}) => ({
  paddingTop: 0,
  paddingBottom: 0,
}));

export const AccountsList: FC<AccountsListProps> = ({
  organizationName,
  accounts,
  hasFinancial = false,
  onCheckToggle,
}) => {
  return (
    <AccountsGroupList data-testid="AccountsGroupList">
      <ListSubheader organizationName={organizationName} />
      {accounts.map((account: Account) => (
        <ListItem
          key={account.id}
          account={account}
          hasFinancial={hasFinancial}
          onCheckToggle={onCheckToggle}
        />
      ))}
    </AccountsGroupList>
  );
};
