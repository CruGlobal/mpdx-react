import { FundTypeEnum } from '../mockData';

// HR Services moves money in and out of these funds. Staff can see the balances but cannot
// transfer them themselves.
const hrManagedFunds: string[] = [
  FundTypeEnum.ReturnTravel,
  FundTypeEnum.ReEntry,
];

export const isHrManagedFund = (fundType: string | undefined): boolean =>
  !!fundType && hrManagedFunds.includes(fundType);
