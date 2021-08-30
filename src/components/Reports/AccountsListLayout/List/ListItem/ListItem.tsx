import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import {
  Box,
  Checkbox,
  Divider,
  Link,
  ListItem,
  ListItemText,
  Typography,
} from '@material-ui/core';
import { Maybe } from 'graphql/jsutils/Maybe';
import { AccountListItemChart as Chart } from './Chart/Chart';
import { currencyFormat } from 'src/lib/intlFormat';
import HandoffLink from 'src/components/HandoffLink';
import { EntryHistoriesQuery } from 'src/components/Reports/ResponsibilityCentersReport/GetEntryHistories.generated';
import { Unarray } from 'src/components/Reports/FourteenMonthReports/Layout/Table/TableHead/TableHead';

type EntryHistoriesGroup = Unarray<EntryHistoriesQuery['entryHistories']>;
type EntryHistory = Unarray<NonNullable<EntryHistoriesGroup>['entryHistories']>;

export type Account = {
  active: boolean | undefined;
  balance: number | undefined;
  code: string | undefined;
  currency: string;
  id: string | undefined;
  lastSyncDate: string | undefined;
  name: Maybe<string>;
  entryHistories?: EntryHistory[] | null | undefined;
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

  const average = useMemo(() => {
    if (account?.entryHistories) {
      return (
        account?.entryHistories?.reduce(
          (total, entryHistory) => total - (entryHistory?.closingBalance ?? 0),
          0,
        ) / account?.entryHistories?.length
      );
    }
  }, [account.entryHistories]);

  const entryHistories = useMemo(() => {
    if (account.entryHistories) {
      return account.entryHistories.map((entryHistory: EntryHistory) => ({
        [account.currency]: -(entryHistory?.closingBalance ?? 0),
        startDate:
          (entryHistory?.endDate &&
            DateTime.fromISO(entryHistory.endDate).toFormat('MMM yy')) ??
          '',
        total: -(entryHistory?.closingBalance ?? 0),
      }));
    }
  }, [account.entryHistories]);

  return (
    <React.Fragment>
      <ListItem style={{ display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" width="100%">
          <ListItemText
            id="line-item-1"
            primary={
              <Box display="flex" width="100%">
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  flexGrow={1}
                >
                  <Box display="flex" flexDirection="column">
                    <Typography variant="h6">{account.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {`${hasFinancial ? '' : t('Designation #')}${
                        account.code
                      } · ${t('Last Synced')} ${
                        account.lastSyncDate
                          ? DateTime.fromISO(
                              account.lastSyncDate,
                            ).toLocaleString()
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
                <Checkbox
                  edge="end"
                  onChange={(event) =>
                    account.id && onCheckToggle(event, account.id)
                  }
                  checked={account.active}
                />
              </Box>
            }
          />
        </Box>
        {account.active && account.entryHistories && (
          <Chart
            average={average ?? 0}
            currencyCode={account.currency}
            data={entryHistories}
          />
        )}
      </ListItem>
      <Divider />
    </React.Fragment>
  );
};
