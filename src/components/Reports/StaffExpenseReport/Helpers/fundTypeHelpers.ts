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

interface FundTypeConfig {
  icon: SvgIconComponent;
  getColor: (theme: Theme) => string;
}

const fundTypeConfig: Record<string, FundTypeConfig> = {
  Primary: {
    icon: Wallet,
    getColor: (theme) => theme.palette.chartOrange.main,
  },
  Savings: {
    icon: Savings,
    getColor: (theme) => theme.palette.chartBlueDark.main,
  },
  'Staff Conference Savings': {
    icon: Diversity1,
    getColor: (theme) => theme.palette.chartBlue.main,
  },
  'Return Travel': {
    icon: Flight,
    getColor: (theme) => theme.palette.chipYellowDark.main,
  },
  'Re-Entry': {
    icon: Home,
    getColor: (theme) => theme.palette.chartGray.main,
  },
};

const defaultFundTypeConfig: FundTypeConfig = {
  icon: Groups,
  getColor: (theme) => theme.palette.chartBlue.main,
};

export const getIconForFundType = (fundType: string): SvgIconComponent =>
  (fundTypeConfig[fundType] ?? defaultFundTypeConfig).icon;

export const getIconColorForFundType = (
  fundType: string,
  theme: Theme,
): string =>
  (fundTypeConfig[fundType] ?? defaultFundTypeConfig).getColor(theme);
