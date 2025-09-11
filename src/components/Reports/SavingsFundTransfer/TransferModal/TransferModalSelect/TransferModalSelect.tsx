import React from 'react';
import { Box, MenuItem, Select, SelectProps } from '@mui/material';
import {
  PrimaryAccount,
  SavingsAccount,
} from 'src/components/Reports/SavingsFundTransfer/Helper/TransferIcons';
import { TransferDirectionEnum } from '../../Helper/TransferHistoryEnum';
import { Fund, FundTypeEnum } from '../../mockData';

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
      : funds.filter((fund) => fund.id !== selectedTransferFrom);

  return (
    <Select {...props}>
      {filteredFunds.map((fund) => (
        <MenuItem key={fund.id} value={fund.id}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {fund.name === FundTypeEnum.Primary
              ? PrimaryAccount
              : fund.name === FundTypeEnum.Savings
                ? SavingsAccount
                : null}{' '}
            <b>{fund.name} Account</b>
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
};
