import NextLink from 'next/link';
import React, { FC, useMemo } from 'react';
import {
  Box,
  Checkbox,
  Divider,
  Link,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Maybe } from 'graphql/jsutils/Maybe';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { EntryHistoriesQuery } from 'src/components/Reports/FinancialAccountsReport/FinancialAccounts/FinancialAccounts.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, dateFormat } from 'src/lib/intlFormat';
import { Unarray } from '../../../Reports.type';
import { AccountListItemChart as Chart } from './Chart/Chart';

const StyledCheckbox = styled(Checkbox)(({}) => ({
  height: '42px',
  margin: 'auto',
}));

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
  const accountListId = useAccountListId() ?? '';
  const locale = useLocale();

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
        startDate: entryHistory?.endDate
          ? DateTime.fromISO(entryHistory.endDate)
              .toJSDate()
              .toLocaleDateString(locale, {
                month: 'short',
                year: '2-digit',
              })
          : '',
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
                        account.code ?? ''
                      } · ${t('Last Synced')} ${
                        account.lastSyncDate
                          ? dateFormat(
                              DateTime.fromISO(account.lastSyncDate),
                              locale,
                            )
                          : ''
                      }`}
                    </Typography>
                    {hasFinancial && (
                      <Box display="flex" gap={0.5}>
                        <Link
                          component={NextLink}
                          href={`/accountLists/${accountListId}/reports/financialAccounts/${account.id}`}
                          shallow
                        >
                          {t('Summary')}
                        </Link>
                        {' · '}
                        <Link
                          component={NextLink}
                          href={`/accountLists/${accountListId}/reports/financialAccounts/${account.id}/entries`}
                          shallow
                        >
                          {t('Transactions')}
                        </Link>
                      </Box>
                    )}
                  </Box>
                  <Typography>
                    {currencyFormat(
                      account.balance ?? 0,
                      account.currency,
                      locale,
                    )}
                  </Typography>
                </Box>
                <StyledCheckbox
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
