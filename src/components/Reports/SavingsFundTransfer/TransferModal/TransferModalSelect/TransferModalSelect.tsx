import React from 'react';
import { Box, MenuItem, Select, SelectProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  PrimaryAccount,
  SavingsAccount,
} from 'src/components/Reports/SavingsFundTransfer/Helper/TransferIcons';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { TransferDirectionEnum } from '../../Helper/TransferHistoryEnum';
import { FundFieldsFragment } from '../../ReportsSavingsFund.generated';
import { FundTypeEnum } from '../../mockData';

type TransferModalSelectProps = Partial<SelectProps> & {
  type: TransferDirectionEnum;
  funds: FundFieldsFragment[];
  selectedTransferFrom?: string;
};

export const TransferModalSelect: React.FC<TransferModalSelectProps> = ({
  type,
  selectedTransferFrom,
  funds,
  ...props
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const filteredFunds =
    type === TransferDirectionEnum.From
      ? funds
      : funds.filter((fund) => fund.id !== selectedTransferFrom);

  return (
    <Select {...props}>
      {filteredFunds.map((fund) => (
        <MenuItem key={fund.id} value={fund.id}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {fund.fundType === FundTypeEnum.Primary
              ? PrimaryAccount
              : fund.fundType === FundTypeEnum.Savings
                ? SavingsAccount
                : null}{' '}
            <b>{t(`${fund.fundType} Account`)}</b> -{' '}
            {currencyFormat(fund.balance, 'USD', locale)} available
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
};
