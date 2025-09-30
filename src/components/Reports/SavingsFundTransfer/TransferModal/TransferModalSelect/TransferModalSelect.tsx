import React from 'react';
import { Box, MenuItem, Select, SelectProps } from '@mui/material';
import {
  PrimaryAccount,
  SavingsAccount,
} from 'src/components/Reports/SavingsFundTransfer/Helper/TransferIcons';
import { TransferDirectionEnum } from '../../Helper/TransferHistoryEnum';
import { FundTypeEnum } from '../../mockData';

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
            {fund.fundType === FundTypeEnum.Primary
              ? PrimaryAccount
              : fund.fundType === FundTypeEnum.Savings
                ? SavingsAccount
                  : null}{' '}
            <b>{fund.name}</b>
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
};
