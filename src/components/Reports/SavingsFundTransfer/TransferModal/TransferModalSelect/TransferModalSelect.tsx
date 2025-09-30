import React from 'react';
import { MenuItem, Select, SelectProps } from '@mui/material';
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
  const filteredFunds =
    notSelected === null
      ? funds
      : funds.filter((fund) => fund.fundType !== notSelected);

  return (
    <Select {...props} disabled={disabled}>
      {filteredFunds.map((fund) => (
        <MenuItem key={fund.id} value={fund.fundType}>
          <FundInfoDisplay fund={fund} />
        </MenuItem>
      ))}
    </Select>
  );
};
