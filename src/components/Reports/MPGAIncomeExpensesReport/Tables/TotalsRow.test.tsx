import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { amountFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { TotalsRow } from './TotalsRow';

const mutationSpy = jest.fn();

const incomeData = [
  {
    id: crypto.randomUUID(),
    description: 'Contributions',
    monthly: [
      6770, 6090, 5770, 7355, 8035, 6575, 7556, 8239, 9799, 9729, 13020, 0,
    ],
    average: 7412,
    total: 88938,
  },
  {
    id: crypto.randomUUID(),
    description: 'Fr Andre, Fre to Mouna Ghar',
    monthly: [100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0],
    average: 58,
    total: 700,
  },
];

const overallTotal = incomeData.reduce((acc, item) => acc + item.total, 0);

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <TotalsRow data={incomeData} overallTotal={overallTotal} />
      </GqlMockedProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('TotalsRow', () => {
  it('should render data correctly', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('columnheader', { name: 'Overall Total' }),
    ).toBeInTheDocument();
    expect(getByRole('columnheader', { name: '6,870' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: '6,190' })).toBeInTheDocument();
  });

  it('should display the correct overall total', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('columnheader', { name: '89,638' })).toBeInTheDocument();
  });

  it('should display "-" when there is no data', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('columnheader', { name: '-' })).toBeInTheDocument();
  });

  it('should format numbers correctly', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('columnheader', { name: '6,870' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: '6,190' })).toBeInTheDocument();

    expect(amountFormat(6870, 'en-US')).toBe('6,870');
    expect(amountFormat(6190, 'en-US')).toBe('6,190');

    expect(amountFormat(null, 'en-US')).toBe('');
  });
});
