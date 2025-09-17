import React from 'react';
import { Box, MenuItem, Select, SelectProps, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  PrimaryAccount,
  SavingsAccount,
} from 'src/components/Reports/SavingsFundTransfer/Helper/TransferIcons';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { FundFieldsFragment } from '../../ReportsSavingsFund.generated';
import { FundTypeEnum } from '../../mockData';

type TransferModalSelectProps = Partial<SelectProps> & {
  funds: FundFieldsFragment[];
  notSelected?: string;
  disabled?: boolean;
};

export const TransferModalSelect: React.FC<TransferModalSelectProps> = ({
  notSelected,
  funds,
  disabled,
  ...props
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const filteredFunds =
    notSelected === null
      ? funds
      : funds.filter((fund) => fund.fundType !== notSelected);

  return (
    <Select {...props} disabled={disabled}>
      {filteredFunds.map((fund) => (
        <MenuItem key={fund.id} value={fund.fundType}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {fund.fundType === FundTypeEnum.Primary
              ? PrimaryAccount
              : fund.fundType === FundTypeEnum.Savings
                ? SavingsAccount
                : null}{' '}
            {''}
            <Typography>
              <b>{t(`${fund.fundType} Account`)}</b>
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
