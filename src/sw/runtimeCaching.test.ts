import { NetworkOnly } from 'serwist';
import { isNetworkOnly } from './networkOnly';
import { runtimeCaching } from './runtimeCaching';

// serwist is ESM-only and Jest does not transform node_modules
jest.mock('serwist', () => ({ NetworkOnly: class NetworkOnly {} }));

describe('runtimeCaching', () => {
  it('puts the network-only rule first', () => {
    expect(runtimeCaching[0].matcher).toBe(isNetworkOnly);
    expect(runtimeCaching[0].handler).toBeInstanceOf(NetworkOnly);
  });
});
