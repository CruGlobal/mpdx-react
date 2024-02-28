import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '../../../__tests__/util/graphqlMocking';
import { useApiConstants } from './UseApiConstants';

describe('LoadConstants', () => {
  it('returns an object', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useApiConstants(), {
      wrapper: GqlMockedProvider,
    });

    await waitForNextUpdate();

    expect(result.current?.activities).toBeTruthy();
    expect(result.current?.languages).toBeTruthy();
    expect(result.current?.likelyToGiveOptions).toBeTruthy();
    expect(result.current?.locations).toBeTruthy();
  });
});
