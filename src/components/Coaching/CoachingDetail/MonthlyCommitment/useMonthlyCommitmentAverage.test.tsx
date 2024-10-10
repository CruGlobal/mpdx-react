import { ReactElement } from 'react';
import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { useMonthlyCommitmentAverage } from './useMonthlyCommitmentAverage';

const accountListId = 'account-list-1';
const mutationSpy = jest.fn();

const Wrapper = ({ children }: { children: ReactElement }) => (
  <GqlMockedProvider
    mocks={{
      MonthlyCommitmentSingleMonth: {
        reportPledgeHistories: jest
          .fn()
          .mockReturnValueOnce([{ pledged: 50, received: 50 }])
          .mockReturnValueOnce([{ pledged: 100, received: 150 }]),
      },
    }}
    onCall={mutationSpy}
  >
    {children}
  </GqlMockedProvider>
);

describe('useMonthlyCommitmentAverage', () => {
  it('loading is true and average is null when mpdInfo is loading', () => {
    const { result } = renderHook(
      () => useMonthlyCommitmentAverage(accountListId, null),
      { wrapper: GqlMockedProvider },
    );

    expect(result.current).toEqual({ loading: true, average: null });
  });

  it('loading is false and average is null if start date or finish date are not available', () => {
    const { result } = renderHook(
      () =>
        useMonthlyCommitmentAverage(accountListId, {
          activeMpdStartAt: null,
          activeMpdFinishAt: null,
        }),
      { wrapper: GqlMockedProvider },
    );

    expect(result.current).toEqual({ loading: false, average: null });
  });

  it('loading is true and average is null while start and finish months are loading', () => {
    const { result } = renderHook(
      () =>
        useMonthlyCommitmentAverage(accountListId, {
          activeMpdStartAt: '2019-01-01',
          activeMpdFinishAt: '2019-04-30',
        }),
      { wrapper: GqlMockedProvider },
    );

    expect(result.current).toEqual({ loading: true, average: null });
  });

  it('loads pledges for start month and finish month', async () => {
    const { result } = renderHook(
      () =>
        useMonthlyCommitmentAverage(accountListId, {
          activeMpdStartAt: '2019-01-15',
          activeMpdFinishAt: '2019-04-15',
        }),
      { wrapper: Wrapper },
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'MonthlyCommitmentSingleMonth',
        { accountListId, month: '2019-01-31' },
      ),
    );
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'MonthlyCommitmentSingleMonth',
        { accountListId, month: '2019-04-30' },
      ),
    );

    // Increase of $150/month over 3 months
    expect(result.current).toEqual({ loading: false, average: 50 });
  });

  it('clamps finish date to the end of the current month', async () => {
    const { result } = renderHook(
      () =>
        useMonthlyCommitmentAverage(accountListId, {
          activeMpdStartAt: '2019-01-15',
          activeMpdFinishAt: '2020-04-15',
        }),
      { wrapper: Wrapper },
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'MonthlyCommitmentSingleMonth',
        { accountListId, month: '2019-01-31' },
      ),
    );
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'MonthlyCommitmentSingleMonth',
        { accountListId, month: '2020-01-31' },
      ),
    );

    // Increase of $150/month over 12 months
    expect(result.current).toEqual({ loading: false, average: 12.5 });
  });

  it('average is 0 when start and finish dates are in the same month', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useMonthlyCommitmentAverage(accountListId, {
          activeMpdStartAt: '2019-01-05',
          activeMpdFinishAt: '2019-01-25',
        }),
      { wrapper: Wrapper },
    );

    await waitForNextUpdate();

    expect(result.current).toEqual({ loading: false, average: 0 });
  });
});
