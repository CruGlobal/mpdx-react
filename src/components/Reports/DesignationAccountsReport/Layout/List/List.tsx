import React, { FC } from 'react';
import { Divider, List } from '@material-ui/core';
import { DesignationAccountsQuery } from '../../GetDesignationAccounts.generated';
import { DesignationAccountListSubheader as ListSubheader } from './ListSubheader/ListSubheader';
import { DesignationAccountListItem as ListItem } from './ListItem/ListItem';

export interface DesignationAccountsListProps {
  designationAccountsGroup: DesignationAccountsQuery['designationAccounts'][0];
  onCheckToggle: (
    event: React.ChangeEvent<HTMLInputElement>,
    designationAccountId: string,
  ) => void;
}

export const DesignationAccountsList: FC<DesignationAccountsListProps> = ({
  designationAccountsGroup,
  onCheckToggle,
}) => {
  return (
    <List>
      <Divider />
      <ListSubheader
        organizationName={designationAccountsGroup.organizationName}
      />
      {designationAccountsGroup.designationAccounts.map(
        (designationAccount) => (
          <ListItem
            key={designationAccount.id}
            designationAccount={designationAccount}
            onCheckToggle={onCheckToggle}
          />
        ),
      )}
    </List>
  );
};
