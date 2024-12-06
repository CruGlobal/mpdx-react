import { ReactElement } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { HealthIndicatorGraphQuery } from './HealthIndicatorGraph.generated';
import { useGraphData } from './useGraphData';

const Wrapper = ({ children }: { children: ReactElement }) => (
  <GqlMockedProvider<{ HealthIndicatorGraph: HealthIndicatorGraphQuery }>
    mocks={{
      HealthIndicatorGraph: {
        healthIndicatorData: [
          {
            indicationPeriodBegin: '2024-01-01',
            overallHi: 33,
            consistencyHi: 7,
            depthHi: 21,
            ownershipHi: 35,
            successHi: 49,
          },
          {
            indicationPeriodBegin: '2024-02-01',
            overallHi: null,
            consistencyHi: null,
            depthHi: null,
            ownershipHi: null,
            successHi: null,
          },
          {
            indicationPeriodBegin: '2024-03-01',
            overallHi: 40,
            consistencyHi: 14,
            depthHi: 28,
            ownershipHi: 42,
            successHi: 56,
          },
        ],
      },
    }}
  >
    {children}
  </GqlMockedProvider>
);

const accountListId = 'account-list-1';

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
        wrapper: Wrapper,
      },
    );

    expect(result.current.average).toBe(null);
    await waitForNextUpdate();
    expect(result.current.average).toBe(37); // (33 + 44) / 2, rounded
  });

  it('calculates the periods', async () => {
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
        consistencyHi: 7,
        depthHi: 21,
        ownershipHi: 35,
        successHi: 49,
        consistencyHiScaled: 1,
        depthHiScaled: 3,
        ownershipHiScaled: 15,
        successHiScaled: 14,
      },
      {
        month: 'Feb 2024',
        consistencyHi: null,
        depthHi: null,
        ownershipHi: null,
        successHi: null,
        consistencyHiScaled: null,
        depthHiScaled: null,
        ownershipHiScaled: null,
        successHiScaled: null,
      },
      {
        month: 'Mar 2024',
        consistencyHi: 14,
        consistencyHiScaled: 2,
        depthHi: 28,
        depthHiScaled: 4,
        ownershipHi: 42,
        ownershipHiScaled: 18,
        successHi: 56,
        successHiScaled: 16,
      },
    ]);
  });
});
