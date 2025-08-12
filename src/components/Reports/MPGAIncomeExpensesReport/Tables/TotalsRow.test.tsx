import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { TotalsRow } from './TotalsRow';

const mutationSpy = jest.fn();

const mockData = {
  accountListId: '12345',
  accountName: 'Test Account',
  income: {
    data: [
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
    ],
  },
};

const overallTotal = mockData.income.data.reduce(
  (acc, item) => acc + item.total,
  0,
);

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <TotalsRow data={mockData.income.data} overallTotal={overallTotal} />
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
});
