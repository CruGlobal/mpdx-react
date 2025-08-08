import React from 'react';
import { Box, MenuItem, Select, SelectProps } from '@mui/material';
import {
  staffAccount,
  staffConferenceSavings,
  staffSavings,
} from 'src/components/Reports/SavingsFundTransfer/Helper/transferIcons';
import {
  StaffSavingFundEnum,
  TransferDirectionEnum,
} from '../../Helper/TransferHistoryEnum';
import { Fund } from '../../mockData';

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
              ? staffAccount
              : fund.type === StaffSavingFundEnum.StaffSavings
              ? staffSavings
              : fund.type === StaffSavingFundEnum.StaffConferenceSavings
              ? staffConferenceSavings
              : null}{' '}
            <strong>{fund.name}</strong>
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
};
