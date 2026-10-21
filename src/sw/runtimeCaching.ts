import { NetworkOnly } from 'serwist';
import { isNetworkOnly } from './networkOnly';
import type { RuntimeCaching } from 'serwist';

// The network-only rule must stay first so later rules can't shadow it.
export const runtimeCaching: RuntimeCaching[] = [
  { matcher: isNetworkOnly, handler: new NetworkOnly() },
];
