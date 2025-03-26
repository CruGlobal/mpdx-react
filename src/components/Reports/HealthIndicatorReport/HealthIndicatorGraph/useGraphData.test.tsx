import { ReactElement } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { DateTime } from 'luxon';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { HealthIndicatorQueryVariables } from 'src/components/Dashboard/MonthlyGoal/HealthIndicator.generated';
import {
  HealthIndicatorGraphDocument,
  HealthIndicatorGraphQuery,
} from './HealthIndicatorGraph.generated';
import {
  calculatePeriodSpans,
  uniqueMonths,
  useGraphData,
  weightedAverage,
} from './useGraphData';

const AverageWrapper = ({ children }: { children: ReactElement }) => (
  <GqlMockedProvider<{ HealthIndicatorGraph: HealthIndicatorGraphQuery }>
    mocks={{
      HealthIndicatorGraph: {
        healthIndicatorData: [
          { indicationPeriodBegin: '2024-01-10', overallHi: 10 },
          { indicationPeriodBegin: '2024-02-15', overallHi: null },
          { indicationPeriodBegin: '2024-02-25', overallHi: 80 },
          { indicationPeriodBegin: '2024-02-26', overallHi: 90 },
        ],
      },
    }}
  >
    {children}
  </GqlMockedProvider>
);

const Wrapper = ({ children }: { children: ReactElement }) => (
  <GqlMockedProvider<{ HealthIndicatorGraph: HealthIndicatorGraphQuery }>
    mocks={{
      HealthIndicatorGraph: {
        healthIndicatorData: [
          {
            indicationPeriodBegin: '2024-01-10',
            consistencyHi: 10,
            depthHi: 10,
            ownershipHi: 10,
            successHi: 10,
          },
          {
            indicationPeriodBegin: '2024-01-31',
            consistencyHi: 40,
            depthHi: 40,
            ownershipHi: 40,
            successHi: 40,
          },
          {
            indicationPeriodBegin: '2024-02-15',
            consistencyHi: null,
            depthHi: null,
            ownershipHi: null,
            successHi: null,
          },
          {
            indicationPeriodBegin: '2024-03-05',
            consistencyHi: 40,
            depthHi: 40,
            ownershipHi: 40,
            successHi: 40,
          },
          {
            indicationPeriodBegin: '2024-03-06',
            consistencyHi: 50,
            depthHi: 50,
            ownershipHi: 50,
            successHi: 50,
          },
        ],
      },
    }}
  >
    {children}
  </GqlMockedProvider>
);

const accountListId = 'account-list-1';

describe('weightedAverage', () => {
  it('returns null when items is empty', () => {
    expect(weightedAverage([], 'field', [])).toBeNull();
  });

  it('returns null when items contains only missing values', () => {
    expect(
      weightedAverage([{ field: null }, { field: undefined }], 'field', [1, 1]),
    ).toBeNull();
  });

  it('calculates the weighted average of the field', () => {
    expect(
      weightedAverage(
        [{ field: 1 }, { field: 3 }, { field: 5 }],
        'field',
        [1, 2, 1],
      ),
    ).toBe(3);
  });

  it('ignores missing values', () => {
    expect(
      weightedAverage(
        [
          { field: 1 },
          { field: null },
          { field: 2 },
          { field: undefined },
          { field: 3 },
        ],
        'field',
        [1, 1, 1, 1, 1],
      ),
    ).toBe(2);
  });
});

describe('uniqueMonths', () => {
  it('returns an empty set when data is undefined', () => {
    expect(uniqueMonths(undefined)).toEqual(new Set());
  });

  it('returns the unique months', () => {
    const data = gqlMock<
      HealthIndicatorGraphQuery,
      HealthIndicatorQueryVariables
    >(HealthIndicatorGraphDocument, {
      variables: { accountListId },
      mocks: {
        healthIndicatorData: [
          { indicationPeriodBegin: '2024-01-01' },
          { indicationPeriodBegin: '2024-01-02' },
          { indicationPeriodBegin: '2024-01-03' },
          { indicationPeriodBegin: '2024-02-04' },
          { indicationPeriodBegin: '2024-04-05' },
        ],
      },
    });
    expect(uniqueMonths(data)).toEqual(
      new Set(['2024-01', '2024-02', '2024-04']),
    );
  });
});

describe('calculatePeriodSpans', () => {
  const makePeriod = (
    indicationPeriodBegin: string,
  ): HealthIndicatorGraphQuery['healthIndicatorData'][number] => ({
    id: '',
    indicationPeriodBegin,
  });

  it('returns all 1s when no periods are missing', () => {
    expect(
      calculatePeriodSpans(
        [
          makePeriod('2024-01-05'),
          makePeriod('2024-01-06'),
          makePeriod('2024-01-07'),
          makePeriod('2024-01-08'),
          makePeriod('2024-01-09'),
          makePeriod('2024-01-10'),
        ],
        null,
        null,
      ),
    ).toEqual([1, 1, 1, 1, 1, 1]);
  });

  it('returns an empty array when there are no periods', () => {
    expect(calculatePeriodSpans([], null, null)).toEqual([]);
  });

  it('extrapolates missing days', () => {
    expect(
      calculatePeriodSpans(
        [
          makePeriod('2024-01-05'),
          makePeriod('2024-01-15'),
          makePeriod('2024-01-28'),
        ],
        null,
        null,
      ),
    ).toEqual([
      10, // January 5-14
      13, // January 15-27
      1, // January 28
    ]);
  });

  it('handles custom period start', () => {
    expect(
      calculatePeriodSpans(
        [
          makePeriod('2024-01-05'),
          makePeriod('2024-01-15'),
          makePeriod('2024-01-28'),
        ],
        DateTime.fromISO('2024-01-01'),
        null,
      ),
    ).toEqual([
      14, // January 1-14
      13, // January 15-27
      1, // January 28
    ]);
  });

  it('handles custom period end', () => {
    expect(
      calculatePeriodSpans(
        [
          makePeriod('2024-01-05'),
          makePeriod('2024-01-15'),
          makePeriod('2024-01-28'),
        ],
        null,
        DateTime.fromISO('2024-01-31'),
      ),
    ).toEqual([
      10, // January 5-14
      13, // January 15-27
      4, // January 28-31
    ]);
  });

  it('handles spanning multiple months', () => {
    expect(
      calculatePeriodSpans(
        [
          makePeriod('2024-01-30'),
          makePeriod('2024-02-03'),
          makePeriod('2024-03-03'),
          makePeriod('2024-03-04'),
          makePeriod('2024-03-06'),
        ],
        null,
        null,
      ),
    ).toEqual([
      4, // January 30-February 2
      29, // February 2-March 2
      1, // March 3
      2, // March 4-5
      1, // March 6
    ]);
  });
});

describe('useGraphData', () => {
  it('loading is true while the data is loading', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useGraphData(accountListId),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.loading).toBe(true);
    await waitForNextUpdate();
    expect(result.current.loading).toBe(false);
  });

  it('calculates the average overall value ignoring missing months', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useGraphData(accountListId),
      {
        wrapper: AverageWrapper,
      },
    );

    expect(result.current.average).toBe(null);
    await waitForNextUpdate();
    // Jan 10 - Feb 14 = 36 span * 10 HI
    // Feb 15 - Feb 24 = 10 span * null HI
    // Feb 25          = 1 span  * 80 HI
    // Feb 26          = 1 span  * 90 HI
    // Average = (36*10 + 1*80 + 1*90) / 38 = ~13.95, rounds to 14
    expect(result.current.average).toBe(14);
  });

  it('extrapolates missing periods and averages periods in the same month', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useGraphData(accountListId),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.periods).toBe(null);
    await waitForNextUpdate();
    expect(result.current.periods).toEqual([
      {
        month: 'Jan 2024',
        consistency: 11,
        depth: 11,
        ownership: 11,
        success: 11,
        consistencyScaled: 2,
        depthScaled: 2,
        ownershipScaled: 5,
        successScaled: 3,
      },
      {
        month: 'Feb 2024',
        consistency: null,
        depth: null,
        ownership: null,
        success: null,
        consistencyScaled: null,
        depthScaled: null,
        ownershipScaled: null,
        successScaled: null,
      },
      {
        month: 'Mar 2024',
        consistency: 42,
        depth: 42,
        ownership: 42,
        success: 42,
        consistencyScaled: 6,
        depthScaled: 6,
        ownershipScaled: 18,
        successScaled: 12,
      },
    ]);
  });
});
