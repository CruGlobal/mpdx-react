import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  CategoricalChartProps,
  CategoricalChartState,
} from 'recharts/types/chart/generateCategoricalChart.d';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import {
  DonationHistoriesData,
  DonationHistoriesProps,
} from './DonationHistories';
import DonationHistories from '.';

jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  ComposedChart: (props: CategoricalChartProps) => (
    <>
      <button
        onClick={() =>
          props.onClick?.(
            { activePayload: [{ payload: props.data![0] }] },
            null,
          )
        }
      >
        Period 1
      </button>
      <button
        onClick={() =>
          props.onClick?.(null as unknown as CategoricalChartState, null)
        }
      >
        Outside Period
      </button>
    </>
  ),
}));

const push = jest.fn();

const router = {
  query: { accountListId: '123' },
  isReady: true,
  push,
};

const donationsData: DonationHistoriesData = {
  accountList: {
    currency: 'USD',
    monthlyGoal: 100,
    totalPledges: 2500,
  },
  reportsDonationHistories: {
    periods: [
      {
        convertedTotal: 50,
        startDate: '2019-01-01',
        endDate: '2019-01-31',
        totals: [{ currency: 'USD', convertedAmount: 50 }],
      },
      {
        convertedTotal: 60,
        startDate: '2019-02-01',
        endDate: '2019-02-31',
        totals: [{ currency: 'NZD', convertedAmount: 60 }],
      },
    ],
    averageIgnoreCurrent: 1000,
  },
  healthIndicatorData: [],
};

const TestComponent: React.FC<DonationHistoriesProps> = (props) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <DonationHistories {...props} />
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
      ...donationsData,
      reportsDonationHistories: {
        periods: [
          {
            convertedTotal: 0,
            startDate: '2019-01-01',
            endDate: '2019-01-31',
            totals: [{ currency: 'USD', convertedAmount: 0 }],
          },
          {
            convertedTotal: 0,
            startDate: '2019-02-01',
            endDate: '2019-02-28',
            totals: [{ currency: 'NZD', convertedAmount: 0 }],
          },
        ],
        averageIgnoreCurrent: 0,
      },
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
      const { getByTestId } = render(<TestComponent data={donationsData} />);
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

  describe('onPeriodClick', () => {
    it('is called when a period is clicked', () => {
      const handlePeriodClick = jest.fn();
      const { getByRole } = render(
        <TestComponent
          data={donationsData}
          onPeriodClick={handlePeriodClick}
        />,
      );

      userEvent.click(getByRole('button', { name: 'Period 1' }));
      expect(handlePeriodClick).toHaveBeenCalledTimes(1);
      expect(handlePeriodClick.mock.calls[0][0].toISODate()).toBe(
        donationsData.reportsDonationHistories.periods[0].startDate,
      );
    });

    it('is not called when the chart is clicked', () => {
      const handlePeriodClick = jest.fn();
      const { getByRole } = render(
        <TestComponent
          data={donationsData}
          onPeriodClick={handlePeriodClick}
        />,
      );

      userEvent.click(getByRole('button', { name: 'Outside Period' }));
      expect(handlePeriodClick).not.toHaveBeenCalled();
    });
  });
});
