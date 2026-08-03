import {
  getIconColorForFundType,
  getIconForFundType,
} from 'src/components/Reports/StaffExpenseReport/Helpers/fundTypeHelpers';
import theme from 'src/theme';
import { FundTypeEnum } from '../mockData';

const createFundIcon = (fundType: FundTypeEnum, titleAccess: string) => {
  const Icon = getIconForFundType(fundType);

  return (
    <Icon
      titleAccess={titleAccess}
      sx={{
        backgroundColor: getIconColorForFundType(fundType, theme),
        color: 'primary.contrastText',
        borderRadius: 1,
        p: 0.25,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mr: 1,
      }}
    />
  );
};

const fundIcons: Record<FundTypeEnum, JSX.Element> = {
  [FundTypeEnum.Primary]: createFundIcon(
    FundTypeEnum.Primary,
    'Primary Account',
  ),
  [FundTypeEnum.Savings]: createFundIcon(
    FundTypeEnum.Savings,
    'Savings Account',
  ),
  [FundTypeEnum.ConferenceSavings]: createFundIcon(
    FundTypeEnum.ConferenceSavings,
    'Staff Conference Savings Account',
  ),
  [FundTypeEnum.ReturnTravel]: createFundIcon(
    FundTypeEnum.ReturnTravel,
    'Return Travel Account',
  ),
  [FundTypeEnum.ReEntry]: createFundIcon(
    FundTypeEnum.ReEntry,
    'Re-Entry Account',
  ),
};

export const getFundIcon = (
  fundType: string | undefined,
): JSX.Element | undefined => fundIcons[fundType as FundTypeEnum];
