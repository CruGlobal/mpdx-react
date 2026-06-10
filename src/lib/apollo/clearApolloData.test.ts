import { ApolloClient } from '@apollo/client';
import { cachePersistor } from './cachePersistor';
import { clearApolloData } from './clearApolloData';

jest.mock('./cachePersistor', () => ({
  cachePersistor: {
    pause: jest.fn(),
    purge: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockedPersistor = cachePersistor as unknown as {
  pause: jest.Mock;
  purge: jest.Mock;
};

describe('clearApolloData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('pauses the persistor, clears the store, then purges in order', async () => {
    const calls: string[] = [];
    mockedPersistor.pause.mockImplementation(() => calls.push('pause'));
    mockedPersistor.purge.mockImplementation(() => {
      calls.push('purge');
      return Promise.resolve();
    });
    const clearStore = jest.fn().mockImplementation(() => {
      calls.push('clearStore');
      return Promise.resolve();
    });
    const client = { clearStore } as unknown as ApolloClient<object>;

    await clearApolloData(client);

    expect(calls).toEqual(['pause', 'clearStore', 'purge']);
  });

  it('pauses before clearing the store', async () => {
    const clearStore = jest.fn().mockResolvedValue(undefined);
    const client = { clearStore } as unknown as ApolloClient<object>;

    await clearApolloData(client);

    expect(mockedPersistor.pause).toHaveBeenCalledTimes(1);
    expect(mockedPersistor.pause.mock.invocationCallOrder[0]).toBeLessThan(
      clearStore.mock.invocationCallOrder[0],
    );
  });

  it('awaits clearStore before purging', async () => {
    let clearStoreResolved = false;
    const clearStore = jest.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) =>
          setTimeout(() => {
            clearStoreResolved = true;
            resolve();
          }, 0),
        ),
    );
    mockedPersistor.purge.mockImplementation(() => {
      expect(clearStoreResolved).toBe(true);
      return Promise.resolve();
    });
    const client = { clearStore } as unknown as ApolloClient<object>;

    await clearApolloData(client);

    expect(mockedPersistor.purge).toHaveBeenCalledTimes(1);
  });
});
