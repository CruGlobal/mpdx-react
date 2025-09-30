import theme from 'src/theme';
import {
  ConferenceSavingsAccount,
  PrimaryAccount,
  SavingsAccount,
} from '../../Helper/TransferIcons';
import { StatusEnum } from '../../mockData';

export const iconMap: Record<string, React.ReactElement> = {
  primary: PrimaryAccount,
  conference: ConferenceSavingsAccount,
  savings: SavingsAccount,
};

export const chipStyle: Record<
  StatusEnum,
  { avatarColor: string; chipColor: string }
> = {
  [StatusEnum.Pending]: {
    avatarColor: theme.palette.chipYellowDark.main,
    chipColor: theme.palette.chipYellowLight.main,
  },
  [StatusEnum.Ongoing]: {
    avatarColor: theme.palette.chipBlueDark.main,
    chipColor: theme.palette.chipBlueLight.main,
  },
  [StatusEnum.Complete]: {
    avatarColor: theme.palette.chipGreenDark.main,
    chipColor: theme.palette.chipGreenLight.main,
  },
  [StatusEnum.Ended]: {
    avatarColor: theme.palette.chipGrayDark.main,
    chipColor: theme.palette.chipGrayLight.main,
  },
  [StatusEnum.Failed]: {
    avatarColor: theme.palette.chipRedDark.main,
    chipColor: theme.palette.chipRedLight.main,
  },
};
