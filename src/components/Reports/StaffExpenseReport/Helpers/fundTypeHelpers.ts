import {
  Diversity1,
  Groups,
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
    return theme.palette.chartBlueLight.main;
  }
  return theme.palette.chartBlue.main;
};
