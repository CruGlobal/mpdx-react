import React from 'react';
import { Box, MenuItem, Select, SelectProps } from '@mui/material';
import { FundFieldsFragment } from '../../ReportsSavingsFund.generated';
import { FundInfoDisplay } from '../Helper/FundInfoDisplay';

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
  const filteredFunds = notSelected
    ? funds.filter((fund) => fund.fundType !== notSelected)
    : funds;

  return (
    <Select
      {...props}
      disabled={disabled}
      renderValue={(selected) => {
        const fund = filteredFunds.find((f) => f.fundType === selected);
        return (
          <Box
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%',
              minWidth: 0,
            }}
          >
            <FundInfoDisplay fund={fund} />
          </Box>
        );
      }}
    >
      {filteredFunds.map((fund) => (
        <MenuItem key={fund.id} value={fund.fundType}>
          <FundInfoDisplay fund={fund} />
        </MenuItem>
      ))}
    </Select>
  );
};
