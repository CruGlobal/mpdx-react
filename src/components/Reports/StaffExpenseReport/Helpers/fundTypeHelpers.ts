import {
  Diversity1,
  Flight,
  Groups,
  Home,
  Savings,
  SvgIconComponent,
  Wallet,
} from '@mui/icons-material';
import { Theme } from '@mui/material/styles';

export const getIconForFundType = (fundType: string): SvgIconComponent => {
  if (fundType === 'Primary') {
    return Wallet;
  }
  if (fundType === 'Savings') {
    return Savings;
  }
  if (fundType === 'Staff Conference Savings') {
    return Diversity1;
  }
  if (fundType === 'Return Travel') {
    return Flight;
  }
  if (fundType === 'Re-Entry') {
    return Home;
  }
  return Groups;
};

export const getIconColorForFundType = (
  fundType: string,
  theme: Theme,
): string => {
  if (fundType === 'Primary') {
    return theme.palette.chartOrange.main;
  }
  if (fundType === 'Savings') {
    return theme.palette.chartBlueDark.main;
  }
  if (fundType === 'Staff Conference Savings') {
    return theme.palette.chartBlue.main;
  }
  if (fundType === 'Return Travel') {
    return theme.palette.chipYellowDark.main;
  }
  if (fundType === 'Re-Entry') {
    return theme.palette.chartGray.main;
  }
  return theme.palette.chartBlue.main;
};
