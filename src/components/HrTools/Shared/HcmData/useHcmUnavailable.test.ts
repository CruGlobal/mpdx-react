import { ApolloError } from '@apollo/client';
import { renderHook } from '@testing-library/react-hooks';
import { GraphQLError } from 'graphql';
import { useHcmUnavailable } from './useHcmUnavailable';

const apolloError = (code: string) =>
  new ApolloError({
    graphQLErrors: [
      new GraphQLError('Request failed', { extensions: { code } }),
    ],
  });

const query = (error?: ApolloError) => ({
  error,
  refetch: jest.fn().mockResolvedValue(undefined),
});

describe('useHcmUnavailable', () => {
  it('is not unavailable without errors', () => {
    const { result } = renderHook(() => useHcmUnavailable(query(), query()));

    expect(result.current.hcmUnavailable).toBe(false);
  });

  it.each([
    ['the Hcm query', apolloError('HCM_UNAVAILABLE'), undefined, true],
    ['the HCM-backed query', undefined, apolloError('HCM_UNAVAILABLE'), true],
    ['another error code', apolloError('NOT_FOUND'), undefined, false],
  ])('reports %s', (_, hcmQueryError, hcmBackedQueryError, expected) => {
    const { result } = renderHook(() =>
      useHcmUnavailable(query(hcmQueryError), query(hcmBackedQueryError)),
    );

    expect(result.current.hcmUnavailable).toBe(expected);
  });

  it('refetches only the query that failed with HCM_UNAVAILABLE', async () => {
    const hcmQuery = query();
    const hcmBackedQuery = query(apolloError('HCM_UNAVAILABLE'));
    const { result } = renderHook(() =>
      useHcmUnavailable(hcmQuery, hcmBackedQuery),
    );

    await result.current.refetchHcm();

    expect(hcmQuery.refetch).not.toHaveBeenCalled();
    expect(hcmBackedQuery.refetch).toHaveBeenCalledTimes(1);
  });
});
