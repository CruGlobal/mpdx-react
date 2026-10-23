import { act, renderHook } from '@testing-library/react-hooks';
import { readSyncRecord } from 'src/lib/apollo/persistence/cachePersistence';
import { contactsSync } from 'src/lib/offlineSync/contacts/contactsSync';
import { syncVersion } from 'src/lib/offlineSync/offlineSync';
import { useCachedContactsAvailable } from './useCachedContactsAvailable';

jest.mock('src/lib/apollo/persistence/cachePersistence');

const mockRead = readSyncRecord as jest.MockedFunction<typeof readSyncRecord>;

const setOnline = (online: boolean) => {
  jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(online);
  act(() => {
    window.dispatchEvent(new Event(online ? 'online' : 'offline'));
  });
};

describe('useCachedContactsAvailable', () => {
  beforeEach(() => {
    jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('is false when there is no record', async () => {
    mockRead.mockResolvedValue(null);
    const { result, waitFor } = renderHook(() =>
      useCachedContactsAvailable('account-1'),
    );
    await waitFor(() => expect(result.current).toBe(false));
    expect(mockRead).toHaveBeenCalledWith('contacts:account-1');
  });

  it('is true when the version matches', async () => {
    mockRead.mockResolvedValue({
      syncedAt: 1,
      version: syncVersion(contactsSync),
    });
    const { result, waitFor } = renderHook(() =>
      useCachedContactsAvailable('account-1'),
    );
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('is false when the version is stale', async () => {
    mockRead.mockResolvedValue({ syncedAt: 1, version: 'old' });
    const { result, waitFor } = renderHook(() =>
      useCachedContactsAvailable('account-1'),
    );
    await waitFor(() => expect(result.current).toBe(false));
  });

  it('is false when the read rejects', async () => {
    mockRead.mockRejectedValue(new Error('idb'));
    const { result, waitFor } = renderHook(() =>
      useCachedContactsAvailable('account-1'),
    );
    await waitFor(() => expect(result.current).toBe(false));
  });

  it('is undefined before the read resolves', async () => {
    mockRead.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() =>
      useCachedContactsAvailable('account-1'),
    );
    expect(result.current).toBeUndefined();
  });

  it('re-reads when the connection comes back', async () => {
    mockRead.mockResolvedValue(null);
    const { result, waitFor } = renderHook(() =>
      useCachedContactsAvailable('account-1'),
    );
    await waitFor(() => expect(result.current).toBe(false));
    expect(mockRead).toHaveBeenCalledTimes(1);

    setOnline(false);
    mockRead.mockResolvedValue({
      syncedAt: 1,
      version: syncVersion(contactsSync),
    });
    setOnline(true);
    await waitFor(() => expect(result.current).toBe(true));
    expect(mockRead.mock.calls.length).toBeGreaterThan(1);
  });

  it('ignores a stale read when the account list changes', async () => {
    let resolveFirst: (value: null) => void = () => {};
    mockRead.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFirst = resolve;
      }),
    );
    mockRead.mockResolvedValueOnce({
      syncedAt: 1,
      version: syncVersion(contactsSync),
    });
    const { result, rerender, waitFor } = renderHook(
      ({ id }) => useCachedContactsAvailable(id),
      { initialProps: { id: 'a' } },
    );
    rerender({ id: 'b' });
    await waitFor(() => expect(result.current).toBe(true));
    await act(async () => {
      resolveFirst(null);
    });
    expect(result.current).toBe(true);
  });
});
