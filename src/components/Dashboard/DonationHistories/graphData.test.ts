import { Settings } from 'luxon';
import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  GetDonationGraphDocument,
  GetDonationGraphQuery,
  GetDonationGraphQueryVariables,
} from 'src/components/Reports/DonationsReport/GetDonationGraph.generated';
import { calculateGraphData } from './graphData';

const variables: GetDonationGraphQueryVariables = {
  accountListId: 'account-list-1',
  periodBegin: '2020-12-01',
  designationAccountIds: [],
};

const graphOptions = {
  locale: 'en-US',
  currencyColors: ['red', 'green', 'blue'],
};

describe('calculateGraphData', () => {
  beforeEach(() => {
    Settings.now = () => new Date(2020, 11, 1).valueOf();
  });

  describe('periods', () => {
    it('is the period data for the graph', () => {
      const data = gqlMock<
        GetDonationGraphQuery,
        GetDonationGraphQueryVariables
      >(GetDonationGraphDocument, {
        mocks: {
          accountList: {
            monthlyGoal: 100,
          },
          reportsDonationHistories: {
            periods: [
              {
                convertedTotal: 30,
                startDate: '2020-11-01',
                totals: [
                  { currency: 'USD', convertedAmount: 10 },
                  { currency: 'EUR', convertedAmount: 20 },
                ],
              },
              {
                convertedTotal: 40,
                startDate: '2020-12-01',
                totals: [
                  { currency: 'EUR', convertedAmount: 15 },
                  { currency: 'CAD', convertedAmount: 15 },
                ],
              },
            ],
          },
          healthIndicatorData: [
            { indicationPeriodBegin: '2020-11-01', staffEnteredGoal: 60 },
            { indicationPeriodBegin: '2020-12-01', staffEnteredGoal: 200 },
          ],
        },
        variables,
      });

      expect(
        calculateGraphData({ ...graphOptions, data }).periods,
      ).toMatchObject([
        {
          currencies: { USD: 10, EUR: 20 },
          goal: 60,
          startDate: 'Nov 20',
          total: 30,
        },
        {
          currencies: { EUR: 15, CAD: 15 },
          goal: 100,
          startDate: 'Dec 20',
          total: 40,
        },
      ]);
    });

    it('uses the machine calculated goal when the staff entered goal is missing', () => {
      const data = gqlMock<
        GetDonationGraphQuery,
        GetDonationGraphQueryVariables
      >(GetDonationGraphDocument, {
        mocks: {
          accountList: {
            currency: 'USD',
            monthlyGoal: null,
          },
          reportsDonationHistories: {
            periods: [
              { startDate: '2020-08-01' },
              { startDate: '2020-09-01' },
              { startDate: '2020-10-01' },
              { startDate: '2020-11-01' },
              { startDate: '2020-12-01' },
            ],
          },
          healthIndicatorData: [
            {
              indicationPeriodBegin: '2020-09-01',
              staffEnteredGoal: null,
              machineCalculatedGoal: null,
            },
            {
              indicationPeriodBegin: '2020-10-01',
              staffEnteredGoal: null,
              machineCalculatedGoal: 100,
              machineCalculatedGoalCurrency: 'EUR',
            },
            {
              indicationPeriodBegin: '2020-11-01',
              staffEnteredGoal: null,
              machineCalculatedGoal: 100,
              machineCalculatedGoalCurrency: 'USD',
            },
            {
              indicationPeriodBegin: '2020-12-01',
              staffEnteredGoal: 200,
              machineCalculatedGoal: 100,
              machineCalculatedGoalCurrency: 'USD',
            },
          ],
        },
        variables,
      });

      expect(
        calculateGraphData({ ...graphOptions, data }).periods,
      ).toMatchObject([
        { goal: null, startDate: 'Aug 20' }, // no health indicator period
        { goal: null, startDate: 'Sep 20' }, // no staff-entered or estimated goal
        { goal: null, startDate: 'Oct 20' }, // ignoring estimated goal because currency doesn't match
        { goal: 100, startDate: 'Nov 20' }, // using estimated goal because no staff-entered goal available
        { goal: 200, startDate: 'Dec 20' }, // using staff-entered goal
      ]);
    });
  });

  describe('empty', () => {
    it('is true when data is undefined', () => {
      expect(
        calculateGraphData({ ...graphOptions, data: undefined }).empty,
      ).toBe(true);
    });

    it('is true when periods are empty', () => {
      const data = gqlMock<
        GetDonationGraphQuery,
        GetDonationGraphQueryVariables
      >(GetDonationGraphDocument, {
        mocks: {
          reportsDonationHistories: {
            periods: [],
          },
        },
        variables,
      });
      expect(calculateGraphData({ ...graphOptions, data }).empty).toBe(true);
    });

    it('is true when periods are all zeros', () => {
      const data = gqlMock<
        GetDonationGraphQuery,
        GetDonationGraphQueryVariables
      >(GetDonationGraphDocument, {
        mocks: {
          reportsDonationHistories: {
            periods: [{ convertedTotal: 0 }, { convertedTotal: 0 }],
          },
        },
        variables,
      });
      expect(calculateGraphData({ ...graphOptions, data }).empty).toBe(true);
    });

    it('is false when a period has a non-zero total', () => {
      const data = gqlMock<
        GetDonationGraphQuery,
        GetDonationGraphQueryVariables
      >(GetDonationGraphDocument, {
        mocks: {
          reportsDonationHistories: {
            periods: [{ convertedTotal: 0 }, { convertedTotal: 1 }],
          },
        },
        variables,
      });
      expect(calculateGraphData({ ...graphOptions, data }).empty).toBe(false);
    });
  });

  describe('domainMax', () => {
    it('is zero when data is undefined', () => {
      expect(
        calculateGraphData({ ...graphOptions, data: undefined }).domainMax,
      ).toBe(0);
    });

    it('is the period with the greatest total', () => {
      const data = gqlMock<
        GetDonationGraphQuery,
        GetDonationGraphQueryVariables
      >(GetDonationGraphDocument, {
        mocks: {
          accountList: {
            monthlyGoal: 10,
            totalPledges: 20,
          },
          reportsDonationHistories: {
            periods: [{ convertedTotal: 100 }, { convertedTotal: 40 }],
            averageIgnoreCurrent: 50,
          },
          healthIndicatorData: [
            { indicationPeriodBegin: '2020-11-01', staffEnteredGoal: 60 },
            { indicationPeriodBegin: '2020-12-01', staffEnteredGoal: 200 },
          ],
        },
        variables,
      });

      expect(calculateGraphData({ ...graphOptions, data }).domainMax).toBe(100);
    });

    it('is the period with the greatest goal', () => {
      const data = gqlMock<
        GetDonationGraphQuery,
        GetDonationGraphQueryVariables
      >(GetDonationGraphDocument, {
        mocks: {
          accountList: {
            monthlyGoal: 10,
            totalPledges: 20,
          },
          reportsDonationHistories: {
            periods: [
              { convertedTotal: 30, startDate: '2020-11-01' },
              { convertedTotal: 40, startDate: '2020-12-01' },
            ],
            averageIgnoreCurrent: 50,
          },
          healthIndicatorData: [
            { indicationPeriodBegin: '2020-11-01', staffEnteredGoal: 100 },
            { indicationPeriodBegin: '2020-12-01', staffEnteredGoal: 200 },
          ],
        },
        variables,
      });

      expect(calculateGraphData({ ...graphOptions, data }).domainMax).toBe(100);
    });

    it('is the monthly goal', () => {
      const data = gqlMock<
        GetDonationGraphQuery,
        GetDonationGraphQueryVariables
      >(GetDonationGraphDocument, {
        mocks: {
          accountList: {
            monthlyGoal: 100,
            totalPledges: 20,
          },
          reportsDonationHistories: {
            periods: [
              { convertedTotal: 30, startDate: '2020-11-01' },
              { convertedTotal: 40, startDate: '2020-12-01' },
            ],
            averageIgnoreCurrent: 50,
          },
          healthIndicatorData: [
            { indicationPeriodBegin: '2020-11-01', staffEnteredGoal: 60 },
            { indicationPeriodBegin: '2020-12-01', staffEnteredGoal: 200 },
          ],
        },
        variables,
      });

      expect(calculateGraphData({ ...graphOptions, data }).domainMax).toBe(100);
    });

    it('is the total pledges', () => {
      const data = gqlMock<
        GetDonationGraphQuery,
        GetDonationGraphQueryVariables
      >(GetDonationGraphDocument, {
        mocks: {
          accountList: {
            monthlyGoal: 10,
            totalPledges: 100,
          },
          reportsDonationHistories: {
            periods: [
              { convertedTotal: 30, startDate: '2020-11-01' },
              { convertedTotal: 40, startDate: '2020-12-01' },
            ],
            averageIgnoreCurrent: 50,
          },
          healthIndicatorData: [
            { indicationPeriodBegin: '2020-11-01', staffEnteredGoal: 60 },
            { indicationPeriodBegin: '2020-12-01', staffEnteredGoal: 200 },
          ],
        },
        variables,
      });

      expect(calculateGraphData({ ...graphOptions, data }).domainMax).toBe(100);
    });
  });

  describe('currencies', () => {
    it('is the currencies used by all periods', () => {
      const data = gqlMock<
        GetDonationGraphQuery,
        GetDonationGraphQueryVariables
      >(GetDonationGraphDocument, {
        mocks: {
          reportsDonationHistories: {
            periods: [
              { totals: [{ currency: 'USD' }, { currency: 'EUR' }] },
              { totals: [{ currency: 'EUR' }, { currency: 'CAD' }] },
              { totals: [{ currency: 'MXN' }, { currency: 'CAD' }] },
            ],
          },
        },
        variables,
      });

      expect(calculateGraphData({ ...graphOptions, data }).currencies).toEqual([
        { fill: 'red', name: 'USD' },
        { fill: 'green', name: 'EUR' },
        { fill: 'blue', name: 'CAD' },
        { fill: 'red', name: 'MXN' },
      ]);
    });
  });
});
