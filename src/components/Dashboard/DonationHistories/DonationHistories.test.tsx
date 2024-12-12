import React from 'react';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import DonationHistories from '.';

const setTime = jest.fn();

const push = jest.fn();

const router = {
  query: { accountListId: '123' },
  isReady: true,
  push,
};

describe('DonationHistories', () => {
  let reportsDonationHistories: Parameters<
    typeof DonationHistories
  >[0]['reportsDonationHistories'];

  it('default', () => {
    const { getByTestId, queryByTestId } = render(
      <TestRouter router={router}>
        <DonationHistories setTime={setTime} />,
      </TestRouter>,
    );
    expect(getByTestId('DonationHistoriesBoxEmpty')).toBeInTheDocument();
    expect(queryByTestId('BarChartSkeleton')).not.toBeInTheDocument();
  });

  it('empty periods', () => {
    reportsDonationHistories = {
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
      <TestRouter router={router}>
        <DonationHistories
          setTime={setTime}
          reportsDonationHistories={reportsDonationHistories}
        />
      </TestRouter>,
    );
    expect(getByTestId('DonationHistoriesBoxEmpty')).toBeInTheDocument();
    expect(queryByTestId('BarChartSkeleton')).not.toBeInTheDocument();
  });

  it('loading', () => {
    const { getByTestId, queryByTestId } = render(
      <TestRouter router={router}>
        <DonationHistories setTime={setTime} loading={true} />
      </TestRouter>,
    );
    expect(getByTestId('BarChartSkeleton')).toBeInTheDocument();
    expect(queryByTestId('DonationHistoriesBoxEmpty')).not.toBeInTheDocument();
  });

  describe('populated periods', () => {
    beforeEach(() => {
      reportsDonationHistories = {
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
    });

    it('shows references', () => {
      const { getByTestId } = render(
        <TestRouter router={router}>
          <DonationHistories
            setTime={setTime}
            reportsDonationHistories={reportsDonationHistories}
            goal={100}
            pledged={2500}
          />
        </TestRouter>,
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
