import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import {
  DonationHistoriesData,
  DonationHistoriesProps,
} from './DonationHistories';
import DonationHistories from '.';

const push = jest.fn();

const router = {
  query: { accountListId: '123' },
  isReady: true,
  push,
};

const TestComponent: React.FC<DonationHistoriesProps> = (props) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <DonationHistories {...props} />,
    </TestRouter>
  </ThemeProvider>
);

describe('DonationHistories', () => {
  it('default', () => {
    const { getByTestId, queryByTestId } = render(
      <TestComponent data={undefined} />,
    );
    expect(getByTestId('DonationHistoriesBoxEmpty')).toBeInTheDocument();
    expect(queryByTestId('BarChartSkeleton')).not.toBeInTheDocument();
  });

  it('empty periods', () => {
    const data: DonationHistoriesData = {
      accountList: {
        currency: 'USD',
        totalPledges: 1000,
      },
      reportsDonationHistories: {
        periods: [
          {
            convertedTotal: 0,
            startDate: '1-1-2019',
            totals: [{ currency: 'USD', convertedAmount: 0 }],
          },
          {
            convertedTotal: 0,
            startDate: '1-2-2019',
            totals: [{ currency: 'NZD', convertedAmount: 0 }],
          },
        ],
        averageIgnoreCurrent: 0,
      },
      healthIndicatorData: [],
    };

    const { getByTestId, queryByTestId } = render(
      <TestComponent data={data} />,
    );
    expect(getByTestId('DonationHistoriesBoxEmpty')).toBeInTheDocument();
    expect(queryByTestId('BarChartSkeleton')).not.toBeInTheDocument();
  });

  it('loading', () => {
    const { getAllByTestId, queryByTestId } = render(
      <TestComponent data={undefined} loading />,
    );
    expect(getAllByTestId('BarChartSkeleton')).toHaveLength(2);
    expect(queryByTestId('DonationHistoriesBoxEmpty')).not.toBeInTheDocument();
  });

  describe('populated periods', () => {
    it('shows references', () => {
      const data: DonationHistoriesData = {
        accountList: {
          currency: 'USD',
          monthlyGoal: 100,
          totalPledges: 2500,
        },
        reportsDonationHistories: {
          periods: [
            {
              convertedTotal: 50,
              startDate: '1-1-2019',
              totals: [{ currency: 'USD', convertedAmount: 50 }],
            },
            {
              convertedTotal: 60,
              startDate: '1-2-2019',
              totals: [{ currency: 'NZD', convertedAmount: 60 }],
            },
          ],
          averageIgnoreCurrent: 1000,
        },
        healthIndicatorData: [],
      };

      const { getByTestId } = render(<TestComponent data={data} />);
      expect(
        getByTestId('DonationHistoriesTypographyGoal').textContent,
      ).toEqual('Goal $100');
      expect(
        getByTestId('DonationHistoriesTypographyAverage').textContent,
      ).toEqual('Average $1,000');
      expect(
        getByTestId('DonationHistoriesTypographyPledged').textContent,
      ).toEqual('Committed $2,500');
    });
  });
});
