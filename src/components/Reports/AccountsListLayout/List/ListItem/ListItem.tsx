import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import {
  Box,
  Checkbox,
  Divider,
  Link,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from '@material-ui/core';
import { Maybe } from 'graphql/jsutils/Maybe';
import { currencyFormat } from 'src/lib/intlFormat';
import HandoffLink from 'src/components/HandoffLink';

export type Account = {
  active: boolean | undefined;
  balance: number | undefined;
  code: string | undefined;
  currency: string | undefined;
  id: string | undefined;
  lastSyncDate: string | undefined;
  name: Maybe<string>;
};

export interface AccountListItemProps {
  account: Account;
  onCheckToggle: (
    event: React.ChangeEvent<HTMLInputElement>,
    accountId: string,
  ) => void;
  hasFinancial?: boolean;
}

export const AccountListItem: FC<AccountListItemProps> = ({
  account,
  hasFinancial = false,
  onCheckToggle,
}) => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <ListItem>
        <ListItemText
          id="line-item-1"
          primary={
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box display="flex" flexDirection="column">
                <Typography variant="h6">{account.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {`${hasFinancial ? '' : t('Designation #')}${
                    account.code
                  } · ${t('Last Synced')} ${
                    account.lastSyncDate
                      ? DateTime.fromISO(account.lastSyncDate).toLocaleString()
                      : ''
                  }`}
                </Typography>
                {hasFinancial && (
                  <Box display="flex">
                    <HandoffLink
                      path={`/reports/financial_accounts/${account.id}`}
                    >
                      <Link>Summary</Link>
                    </HandoffLink>
                    {' · '}
                    <HandoffLink
                      path={`/reports/financial_accounts/${account.id}/entries`}
                    >
                      <Link>Transactions</Link>
                    </HandoffLink>
                  </Box>
                )}
              </Box>
              <Typography>
                {currencyFormat(account.balance ?? 0, account.currency)}
              </Typography>
            </Box>
          }
        />
        <ListItemSecondaryAction>
          <Checkbox
            edge="end"
            onChange={(event) => account.id && onCheckToggle(event, account.id)}
            checked={account.active}
          />
        </ListItemSecondaryAction>
      </ListItem>
      <Divider />
    </React.Fragment>
  );
};
