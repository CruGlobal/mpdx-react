import React from 'react';
import { Box, MenuItem, Select, SelectProps } from '@mui/material';
import {
  StaffAccount,
  StaffConferenceSavings,
  StaffSavings,
} from 'src/components/Reports/SavingsFundTransfer/Helper/TransferIcons';
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
                  : null}{' '}
            <b>{fund.name}</b>
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
};
