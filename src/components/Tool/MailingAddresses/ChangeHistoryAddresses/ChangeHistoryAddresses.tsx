import React from 'react';
import { Typography } from '@mui/material';

interface ChangeHistoryAddressesProps {
  accountListId: string;
}

export const ChangeHistoryAddresses: React.FC<
  ChangeHistoryAddressesProps
> = ({}) => {
  return <div>{<Typography>Change history content goes here</Typography>}</div>;
};
