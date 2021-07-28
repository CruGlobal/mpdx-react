import React, { FC } from 'react';
import { List, styled } from '@material-ui/core';
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

const DesignationAccountsGroupList = styled(List)(({}) => ({
  paddingTop: 0,
  paddingBottom: 0,
}));

export const DesignationAccountsList: FC<DesignationAccountsListProps> = ({
  designationAccountsGroup,
  onCheckToggle,
}) => {
  return (
    <DesignationAccountsGroupList>
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
    </DesignationAccountsGroupList>
  );
};
