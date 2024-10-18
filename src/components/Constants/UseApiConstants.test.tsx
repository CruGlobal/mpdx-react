import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { useApiConstants } from './UseApiConstants';

describe('LoadConstants', () => {
  it('returns an object', async () => {
    const { result } = renderHook(() => useApiConstants(), {
      wrapper: GqlMockedProvider,
    });

    expect(result.current?.activities).toBeTruthy();
    expect(result.current?.languages).toBeTruthy();
    expect(result.current?.likelyToGive).toBeTruthy();
    expect(result.current?.locations).toBeTruthy();
  });
});
