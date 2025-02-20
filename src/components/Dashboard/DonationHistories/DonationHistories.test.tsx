import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { DonationHistoriesProps } from './DonationHistories';
import DonationHistories from '.';

const setTime = jest.fn();

const push = jest.fn();

const router = {
  query: { accountListId: '123' },
  isReady: true,
  push,
};

const TestComponent: React.FC<DonationHistoriesProps> = (props) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <DonationHistories setTime={setTime} {...props} />,
    </TestRouter>
  </ThemeProvider>
);

describe('DonationHistories', () => {
  it('default', () => {
    const { getByTestId, queryByTestId } = render(<TestComponent />);
    expect(getByTestId('DonationHistoriesBoxEmpty')).toBeInTheDocument();
    expect(queryByTestId('BarChartSkeleton')).not.toBeInTheDocument();
  });

  it('empty periods', () => {
    const reportsDonationHistories = {
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
    };

    const { getByTestId, queryByTestId } = render(
      <TestComponent reportsDonationHistories={reportsDonationHistories} />,
    );
    expect(getByTestId('DonationHistoriesBoxEmpty')).toBeInTheDocument();
    expect(queryByTestId('BarChartSkeleton')).not.toBeInTheDocument();
  });

  it('loading', () => {
    const { getAllByTestId, queryByTestId } = render(<TestComponent loading />);
    expect(getAllByTestId('BarChartSkeleton')).toHaveLength(2);
    expect(queryByTestId('DonationHistoriesBoxEmpty')).not.toBeInTheDocument();
  });

  describe('populated periods', () => {
    it('shows references', () => {
      const reportsDonationHistories = {
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
      };

      const { getByTestId } = render(
        <TestComponent
          reportsDonationHistories={reportsDonationHistories}
          goal={100}
          pledged={2500}
        />,
      );
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
