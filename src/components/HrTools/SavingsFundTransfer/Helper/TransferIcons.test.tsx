import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { FundTypeEnum } from '../mockData';
import { getFundIcon } from './TransferIcons';

const Components = ({ fundType }: { fundType: string | undefined }) => (
  <ThemeProvider theme={theme}>{getFundIcon(fundType)}</ThemeProvider>
);

describe('getFundIcon', () => {
  it.each([
    [FundTypeEnum.Primary, 'Primary Account'],
    [FundTypeEnum.Savings, 'Savings Account'],
    [FundTypeEnum.ConferenceSavings, 'Staff Conference Savings Account'],
    [FundTypeEnum.ReturnTravel, 'Return Travel Account'],
    [FundTypeEnum.ReEntry, 'Re-Entry Account'],
  ])('renders an accessible icon for %s', (fundType, name) => {
    const { getByRole } = render(<Components fundType={fundType} />);

    expect(getByRole('img', { name })).toBeInTheDocument();
  });

  it('returns undefined for an unknown fund type', () => {
    expect(getFundIcon('staffAccount')).toBeUndefined();
  });

  it('matches fund types case sensitively', () => {
    expect(getFundIcon('primary')).toBeUndefined();
  });
});
