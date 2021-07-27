import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import {
  Box,
  Checkbox,
  Divider,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from '@material-ui/core';
import { DesignationAccountsQuery } from '../../../GetDesignationAccounts.generated';
import { currencyFormat } from 'src/lib/intlFormat';

export interface DesignationAccountListItemProps {
  designationAccount: DesignationAccountsQuery['designationAccounts'][0]['designationAccounts'][0];
  onCheckToggle: (event: React.MouseEvent<unknown>, checked: boolean) => void;
}

export const DesignationAccountListItem: FC<DesignationAccountListItemProps> = ({
  designationAccount,
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
                <Typography variant="h6">{designationAccount.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {`${t('Designation')} #${
                    designationAccount.designationNumber
                  } · ${t('Last Synced')} ${DateTime.fromISO(
                    designationAccount.balanceUpdatedAt,
                  ).toLocaleString()}`}
                </Typography>
              </Box>
              <Typography>
                {currencyFormat(
                  designationAccount.convertedBalance,
                  designationAccount.currency,
                )}
              </Typography>
            </Box>
          }
        />
        <ListItemSecondaryAction>
          <Checkbox
            edge="end"
            onChange={onCheckToggle}
            checked={designationAccount.active}
            inputProps={{ 'aria-labelledby': 'list-1' }}
          />
        </ListItemSecondaryAction>
      </ListItem>
      <Divider />
    </React.Fragment>
  );
};
