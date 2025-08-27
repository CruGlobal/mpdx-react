import React from 'react';
import { Box, MenuItem, Select, SelectProps, Typography } from '@mui/material';
import {
  StaffAccount,
  StaffConferenceSavings,
  StaffSavings,
} from 'src/components/Reports/SavingsFundTransfer/Helper/TransferIcons';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { TransferDirectionEnum } from '../../Helper/TransferHistoryEnum';
import { Fund, StaffSavingFundEnum } from '../../mockData';

type TransferModalSelectProps = Partial<SelectProps> & {
  type: TransferDirectionEnum;
  funds: Fund[];
  selectedTransferFrom?: string;
};

export const TransferModalSelect: React.FC<TransferModalSelectProps> = ({
  type,
  selectedTransferFrom,
  funds,
  ...props
}) => {
  const locale = useLocale();
  const filteredFunds =
    type === TransferDirectionEnum.From
      ? funds
      : funds.filter((fund) => fund.type !== selectedTransferFrom);

  return (
    <Select {...props}>
      {filteredFunds.map((fund) => (
        <MenuItem key={fund.accountId} value={fund.accountId}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {fund.type === StaffSavingFundEnum.StaffAccount
              ? StaffAccount
              : fund.type === StaffSavingFundEnum.StaffSavings
              ? StaffSavings
              : fund.type === StaffSavingFundEnum.StaffConferenceSavings
              ? StaffConferenceSavings
              : null}
            {''}
            <Typography>
              <b>{fund.name}</b>
              {' - '}
            </Typography>
            <Typography
              sx={{ color: fund.balance < 0 ? 'error.main' : 'text.primary' }}
            >
              {fund.balance < 0 ? ' (' : ' '}
              {currencyFormat(Math.abs(fund.balance), 'USD', locale, {
                showTrailingZeros: true,
              })}
              {fund.balance < 0 ? ')' : ' available'}
            </Typography>
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
};
