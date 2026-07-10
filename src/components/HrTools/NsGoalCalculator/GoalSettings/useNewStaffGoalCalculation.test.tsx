import { ReactElement } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { DeepPartial } from 'ts-essentials';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { NewStaffGoalCalculationQuery } from './NewStaffGoalCalculation.generated';
import { useNewStaffGoalCalculation } from './useNewStaffGoalCalculation';

const mutationSpy = jest.fn();

const makeWrapper = (
  newStaffGoalCalculation:
    | DeepPartial<
        NonNullable<NewStaffGoalCalculationQuery['newStaffGoalCalculation']>
      >
    | null
    | (() => never),
) => {
  const Wrapper = ({ children }: { children: ReactElement }) => (
    <GqlMockedProvider<{
      NewStaffGoalCalculation: NewStaffGoalCalculationQuery;
    }>
      mocks={
        {
          NewStaffGoalCalculation: { newStaffGoalCalculation },
        } as ApolloErgonoMockMap
      }
      onCall={mutationSpy}
    >
      {children}
    </GqlMockedProvider>
  );
  return Wrapper;
};

describe('useNewStaffGoalCalculation', () => {
  it('fetches the real goal by account list in accountList mode', async () => {
    const { result } = renderHook(
      () => useNewStaffGoalCalculation({ accountListId: 'account-list-1' }),
      { wrapper: makeWrapper({ id: 'goal-1', firstName: 'John' }) },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isScenario).toBe(false);
    expect(result.current.goalCalculation?.id).toBe('goal-1');
    expect(mutationSpy).toHaveGraphqlOperation('NewStaffGoalCalculation', {
      accountListId: 'account-list-1',
      id: null,
    });
  });

  it('fetches the scenario goal by id in scenario mode', async () => {
    const { result } = renderHook(
      () => useNewStaffGoalCalculation({ scenarioGoalId: 'scenario-2' }),
      { wrapper: makeWrapper({ id: 'scenario-2', firstName: 'Grace' }) },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isScenario).toBe(true);
    expect(result.current.goalCalculation?.id).toBe('scenario-2');
    expect(result.current.goalCalculation?.firstName).toBe('Grace');
    expect(mutationSpy).toHaveGraphqlOperation('NewStaffGoalCalculation', {
      accountListId: null,
      id: 'scenario-2',
    });
  });

  it('skips the query and returns null when no account list is given', async () => {
    const { result } = renderHook(
      () => useNewStaffGoalCalculation({ accountListId: undefined }),
      { wrapper: makeWrapper({ id: 'goal-1' }) },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.goalCalculation).toBeNull();
    expect(mutationSpy).not.toHaveGraphqlOperation('NewStaffGoalCalculation');
  });

  it('returns null when the scenario goal is not found', async () => {
    const { result } = renderHook(
      () => useNewStaffGoalCalculation({ scenarioGoalId: 'missing' }),
      { wrapper: makeWrapper(null) },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.goalCalculation).toBeNull();
  });

  it('surfaces a query error', async () => {
    const { result } = renderHook(
      () => useNewStaffGoalCalculation({ scenarioGoalId: 'scenario-1' }),
      {
        wrapper: makeWrapper(() => {
          throw new Error('boom');
        }),
      },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeDefined();
    expect(result.current.goalCalculation).toBeNull();
  });

  it('saves scenario edits through updateNewStaffGoalCalculation by id', async () => {
    const { result } = renderHook(
      () => useNewStaffGoalCalculation({ scenarioGoalId: 'scenario-1' }),
      { wrapper: makeWrapper({ id: 'scenario-1', firstName: 'Ada' }) },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    await result.current.save({ firstName: 'Ada Lovelace' });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateNewStaffGoalCalculation',
        {
          input: {
            id: 'scenario-1',
            attributes: { firstName: 'Ada Lovelace' },
          },
        },
      ),
    );
  });

  it('does not save when no goal has loaded', async () => {
    const { result } = renderHook(
      () => useNewStaffGoalCalculation({ accountListId: 'account-list-1' }),
      { wrapper: makeWrapper(null) },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.goalCalculation).toBeNull();

    await result.current.save({ annualRequestedSalary: 5 });

    expect(mutationSpy).not.toHaveGraphqlOperation(
      'UpdateNewStaffGoalCalculation',
    );
  });

  it('saves real edits through updateNewStaffGoalCalculation', async () => {
    const { result } = renderHook(
      () => useNewStaffGoalCalculation({ accountListId: 'account-list-1' }),
      { wrapper: makeWrapper({ id: 'goal-1', firstName: 'John' }) },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    await result.current.save({ annualRequestedSalary: 5 });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateNewStaffGoalCalculation',
        {
          input: {
            accountListId: 'account-list-1',
            id: 'goal-1',
            attributes: { annualRequestedSalary: 5 },
          },
        },
      ),
    );
  });
});
