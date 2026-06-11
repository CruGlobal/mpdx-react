# PWA Phase 2: In-Session Offline Reads Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When the connection drops while MPDX is open, contacts and tasks screens keep rendering from the Apollo cache (read-only), the user sees a clear offline indicator, mutations are blocked with a friendly message instead of failing confusingly, and the session-expiry logic doesn't boot an offline user.

**Architecture:** A `useIsOnline` hook (navigator.onLine + events) feeds an `OfflineNotifier` (persistent notistack warning while offline). A new Apollo `offlineLink` blocks mutations when offline with a localized snackbar; the existing `onError` link stops spamming error snackbars for offline network failures. RouterGuard's expiry `signIn` is gated on being online. Cache persistence moves from localStorage to IndexedDB (`localforage` + `CachePersistor`) with a purge on logout. **Scope is in-session offline only** — cold-start offline is explicitly out (conflicts with the Phase 1 no-authenticated-caching security rule).

**Tech Stack:** React 18, Apollo Client (`@apollo/client`, `apollo3-cache-persist` 0.14.1), localforage (new dep), notistack v2, next-auth v4, react-i18next, Jest + RTL.

**Repo context the engineer must know:**

- Package manager is **yarn**. Named exports only (pages are the default-export exception). All user-visible strings via `t()` / `i18n.t`. Tests colocated.
- `src/lib/apollo/client.ts` builds the client per session (`makeClient(apiToken)`); a module-level `cache` is shared and persisted at module load (top-level `await` is enabled in webpack config).
- `src/components/Snackbar/Snackbar.tsx` exposes imperative `snackNotifications` (default export) usable outside React — already imported by `client.ts`.
- `pages/_app.page.tsx` renders `<ServiceWorkerUpdatePrompt />` inside `SnackbarProvider` — new global components follow the same placement.
- `pages/logout.page.tsx` already clears CacheStorage + Apollo store before `signOut` (Phase 1) — the persistence purge joins that block.
- `src/lib/i18n.ts` exports the i18n instance for non-React `t()` usage.

---

### Task 1: `useIsOnline` hook

**Files:**
- Create: `src/hooks/useIsOnline.ts`
- Create: `src/hooks/useIsOnline.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useIsOnline.test.tsx`:

```tsx
import { act, renderHook } from '@testing-library/react';
import { useIsOnline } from './useIsOnline';

describe('useIsOnline', () => {
  it('returns the initial navigator.onLine value', () => {
    const { result } = renderHook(() => useIsOnline());

    expect(result.current).toBe(true);
  });

  it('returns false after an offline event and true after an online event', () => {
    const { result } = renderHook(() => useIsOnline());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
  });

  it('removes event listeners on unmount', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useIsOnline());
    unmount();

    expect(removeSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    removeSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test useIsOnline.test.tsx`
Expected: FAIL — cannot find module `./useIsOnline`

- [ ] **Step 3: Implement the hook**

Create `src/hooks/useIsOnline.ts`:

```ts
import { useEffect, useState } from 'react';

export const useIsOnline = (): boolean => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test useIsOnline.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Lint and commit**

```bash
yarn lint
git add src/hooks/useIsOnline.ts src/hooks/useIsOnline.test.tsx
git commit -m "Add useIsOnline hook for connectivity detection"
```

---

### Task 2: `OfflineNotifier` — persistent offline indicator

**Files:**
- Create: `src/components/Offline/OfflineNotifier.tsx`
- Create: `src/components/Offline/OfflineNotifier.test.tsx`
- Modify: `pages/_app.page.tsx` (render next to `<ServiceWorkerUpdatePrompt />`)

Depends on Task 1. Uses a persistent notistack warning rather than a layout banner — zero layout risk, consistent with the SW update prompt pattern.

- [ ] **Step 1: Write the failing test**

Create `src/components/Offline/OfflineNotifier.test.tsx`:

```tsx
import React from 'react';
import { act, render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { OfflineNotifier } from './OfflineNotifier';

const TestComponent: React.FC = () => (
  <SnackbarProvider>
    <OfflineNotifier />
  </SnackbarProvider>
);

describe('OfflineNotifier', () => {
  it('shows nothing while online', () => {
    const { queryByText } = render(<TestComponent />);

    expect(
      queryByText('You are offline. Changes cannot be saved until you reconnect.'),
    ).not.toBeInTheDocument();
  });

  it('shows a persistent warning while offline and removes it on reconnect', async () => {
    const { findByText, queryByText } = render(<TestComponent />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(
      await findByText(
        'You are offline. Changes cannot be saved until you reconnect.',
      ),
    ).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(await findByText('You are back online.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test OfflineNotifier.test.tsx`
Expected: FAIL — cannot find module `./OfflineNotifier`

- [ ] **Step 3: Implement the component**

Create `src/components/Offline/OfflineNotifier.tsx`:

```tsx
import React, { useEffect, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useIsOnline } from 'src/hooks/useIsOnline';

const offlineSnackbarKey = 'offline-notifier';

export const OfflineNotifier: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const isOnline = useIsOnline();
  // Skip the "back online" toast on initial mount
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      enqueueSnackbar(
        t('You are offline. Changes cannot be saved until you reconnect.'),
        {
          key: offlineSnackbarKey,
          variant: 'warning',
          persist: true,
          preventDuplicate: true,
        },
      );
    } else {
      closeSnackbar(offlineSnackbarKey);
      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        enqueueSnackbar(t('You are back online.'), { variant: 'success' });
      }
    }
  }, [isOnline, enqueueSnackbar, closeSnackbar, t]);

  return null;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test OfflineNotifier.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Render in `_app.page.tsx`**

Add the import (lint will fix ordering):

```tsx
import { OfflineNotifier } from 'src/components/Offline/OfflineNotifier';
```

Render directly after `<ServiceWorkerUpdatePrompt />` (inside `SnackbarProvider`):

```tsx
<ServiceWorkerUpdatePrompt />
<OfflineNotifier />
```

- [ ] **Step 6: Lint and commit**

```bash
yarn lint
git add src/components/Offline pages/_app.page.tsx
git commit -m "Add persistent offline indicator"
```

---

### Task 3: Apollo offline behavior — block mutations, stop error spam

**Files:**
- Create: `src/lib/apollo/offlineLink.ts`
- Create: `src/lib/apollo/offlineLink.test.ts`
- Modify: `src/lib/apollo/client.ts` (add link to chain; suppress offline network-error snackbars)

- [ ] **Step 1: Write the failing test**

Create `src/lib/apollo/offlineLink.test.ts`:

```ts
import { ApolloLink, Observable, execute, gql } from '@apollo/client';
import { offlineLink } from './offlineLink';

jest.mock('src/components/Snackbar/Snackbar', () => ({
  warning: jest.fn(),
}));

const query = gql`
  query TestContacts {
    contacts {
      id
    }
  }
`;

const mutation = gql`
  mutation TestUpdateContact {
    updateContact {
      id
    }
  }
`;

const makeTerminatingLink = (spy: jest.Mock) =>
  new ApolloLink((operation) => {
    spy(operation.operationName);
    return Observable.of({ data: {} });
  });

const setOnline = (onLine: boolean) =>
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value: onLine,
  });

describe('offlineLink', () => {
  afterEach(() => {
    setOnline(true);
  });

  it('forwards mutations when online', (done) => {
    const spy = jest.fn();
    const link = offlineLink.concat(makeTerminatingLink(spy));

    execute(link, { query: mutation }).subscribe({
      complete: () => {
        expect(spy).toHaveBeenCalledWith('TestUpdateContact');
        done();
      },
    });
  });

  it('blocks mutations when offline with an error', (done) => {
    setOnline(false);
    const spy = jest.fn();
    const link = offlineLink.concat(makeTerminatingLink(spy));

    execute(link, { query: mutation }).subscribe({
      error: (error) => {
        expect(spy).not.toHaveBeenCalled();
        expect(error.message).toContain('offline');
        done();
      },
    });
  });

  it('forwards queries even when offline', (done) => {
    setOnline(false);
    const spy = jest.fn();
    const link = offlineLink.concat(makeTerminatingLink(spy));

    execute(link, { query }).subscribe({
      complete: () => {
        expect(spy).toHaveBeenCalledWith('TestContacts');
        done();
      },
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test offlineLink.test.ts`
Expected: FAIL — cannot find module `./offlineLink`

- [ ] **Step 3: Implement the link**

Create `src/lib/apollo/offlineLink.ts`:

```ts
import { ApolloLink, Observable } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import i18n from 'src/lib/i18n';
import snackNotifications from '../../components/Snackbar/Snackbar';

export const isOffline = (): boolean =>
  typeof navigator !== 'undefined' && !navigator.onLine;

// Blocks mutations while offline so users get one clear message instead of a
// confusing network failure. Queries pass through: cache-and-network renders
// cached data and the network miss is suppressed in the onError link.
export const offlineLink = new ApolloLink((operation, forward) => {
  const definition = getMainDefinition(operation.query);
  const isMutation =
    definition.kind === 'OperationDefinition' &&
    definition.operation === 'mutation';

  if (isMutation && isOffline()) {
    snackNotifications.warning(
      i18n.t('You are offline. Changes cannot be saved until you reconnect.'),
      { preventDuplicate: true },
    );
    return new Observable((observer) => {
      observer.error(
        new Error(i18n.t('Cannot save changes while offline.')),
      );
    });
  }

  return forward(operation);
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test offlineLink.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Wire into `client.ts`**

In `src/lib/apollo/client.ts`:

a) Add import:

```ts
import { isOffline, offlineLink } from './offlineLink';
```

b) Add `offlineLink` to the link chain FIRST (before `makeAuthLink`), so blocked mutations never reach the network stack:

```ts
    link: from([
      offlineLink,
      makeAuthLink(apiToken),
      onError(({ graphQLErrors, networkError, operation }) => {
```

c) In the `networkError` branch (currently lines 62-65), suppress the snackbar when offline — the OfflineNotifier already tells the user what's happening, and every backgrounded query failing offline would otherwise spam error toasts:

```ts
        if (networkError && !isOffline()) {
          dispatch('mpdx-api-error');
          snackNotifications.error(networkError.message);
        }
```

(Note: the mutation-block error from `offlineLink` does NOT pass through `onError` — `offlineLink` is upstream and errors without forwarding, so the error rejects straight to the mutation caller. Components that catch mutation errors may show their own toast with the "Cannot save changes while offline." message — that's acceptable and informative, not a bug.)

- [ ] **Step 6: Run lint:ts + affected tests, commit**

```bash
yarn lint:ts
yarn test offlineLink.test.ts
yarn lint
git add src/lib/apollo/offlineLink.ts src/lib/apollo/offlineLink.test.ts src/lib/apollo/client.ts
git commit -m "Block mutations and suppress error snackbars while offline"
```

---

### Task 4: RouterGuard offline grace

**Files:**
- Modify: `src/components/RouterGuard/RouterGuard.tsx`
- Modify or Create: `src/components/RouterGuard/RouterGuard.test.tsx` (check if it exists first; extend if so, create if not)

Depends on Task 1. Problem: `RouterGuard.tsx:21-28` calls `signIn('okta')` the moment the session expiry timestamp passes. Offline, that redirect fails or strands the user — for read-only offline use, an expired session is fine until reconnect.

- [ ] **Step 1: Write the failing test**

Read the existing `src/components/RouterGuard/RouterGuard.test.tsx` first (if present) and follow its mocking approach for `next-auth/react`. Add (or create the file with) these cases — adapt mock setup to the existing pattern, but the behavioral assertions must be:

```tsx
import React from 'react';
import { render } from '@testing-library/react';
import { signIn, useSession } from 'next-auth/react';
import { RouterGuard } from './RouterGuard';

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  useSession: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const mockUseSession = useSession as jest.Mock;

const expiredSession = {
  status: 'authenticated',
  data: { expires: '2020-01-01T00:00:00.000Z' },
};

const setOnline = (onLine: boolean) =>
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value: onLine,
  });

describe('RouterGuard session expiry', () => {
  afterEach(() => {
    setOnline(true);
  });

  it('re-authenticates when the session is expired and online', () => {
    setOnline(true);
    mockUseSession.mockReturnValue(expiredSession);

    render(
      <RouterGuard>
        <div>content</div>
      </RouterGuard>,
    );

    expect(signIn).toHaveBeenCalledWith('okta');
  });

  it('does not re-authenticate while offline', () => {
    setOnline(false);
    mockUseSession.mockReturnValue(expiredSession);

    render(
      <RouterGuard>
        <div>content</div>
      </RouterGuard>,
    );

    expect(signIn).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify the offline case fails**

Run: `yarn test RouterGuard.test.tsx`
Expected: the "does not re-authenticate while offline" test FAILS (signIn is currently called unconditionally)

- [ ] **Step 3: Implement the guard change**

In `src/components/RouterGuard/RouterGuard.tsx`:

```tsx
import { useIsOnline } from 'src/hooks/useIsOnline';
```

```tsx
  const isOnline = useIsOnline();

  useEffect(() => {
    if (
      // While offline, let an expired session keep rendering cached data;
      // the redirect to Okta would fail anyway. Re-checks on reconnect
      // because isOnline is a dependency.
      isOnline &&
      session.status === 'authenticated' &&
      DateTime.now().toISO() > session.data.expires
    ) {
      signIn('okta');
    }
  }, [session, isOnline]);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test RouterGuard.test.tsx`
Expected: PASS (all cases, including any pre-existing ones)

- [ ] **Step 5: Lint and commit**

```bash
yarn lint
git add src/components/RouterGuard
git commit -m "Keep offline users in the app when their session expires"
```

---

### Task 5: IndexedDB cache persistence + logout purge

**Files:**
- Modify: `package.json` (via `yarn add localforage`)
- Modify: `src/lib/apollo/client.ts` (lines 20-26: persistence block)
- Modify: `pages/logout.page.tsx`

localStorage caps at ~5MB which a real contact list will blow through; `apollo3-cache-persist`'s default `maxSize` (1MB) also silently pauses persistence when exceeded. IndexedDB via localforage removes both limits.

- [ ] **Step 1: Add the dependency**

```bash
yarn add localforage
```

- [ ] **Step 2: Swap the persistence layer in `client.ts`**

Replace lines 20-26 (`const cache = createCache();` through the `persistCache` block) with:

```ts
import localforage from 'localforage';
import { CachePersistor, LocalForageWrapper } from 'apollo3-cache-persist';
```

```ts
const cache = createCache();

// CachePersistor (rather than persistCache) gives logout a handle to purge
// the persisted data. IndexedDB via localforage avoids localStorage's ~5MB
// cap, which a cached contact list can exceed.
export const cachePersistor =
  typeof window !== 'undefined' && process.env.NODE_ENV === 'production'
    ? new CachePersistor({
        cache,
        storage: new LocalForageWrapper(localforage),
        maxSize: false,
      })
    : undefined;

if (cachePersistor) {
  await cachePersistor.restore();
  // Remove the cache persisted to localStorage by the previous implementation
  window.localStorage.removeItem('apollo-cache-persist');
}
```

Remove the now-unused `LocalStorageWrapper, persistCache` import. Verify `CachePersistor` and `LocalForageWrapper` are exported by the installed `apollo3-cache-persist@0.14.1` (check `node_modules/apollo3-cache-persist/lib/index.d.ts`).

- [ ] **Step 3: Purge on logout**

In `pages/logout.page.tsx`, the effect currently clears CacheStorage, DataDog, and the Apollo store before `signOut`. Add the persistor purge after `client.clearStore()`:

```tsx
import makeClient, { cachePersistor } from 'src/lib/apollo/client';
```

(check the existing import shape — `makeClient` may already be imported; extend it)

```tsx
      clearDataDogUser();
      await client.clearStore();
      // Remove the persisted Apollo cache so the next user of a shared
      // device cannot read this user's cached contact data.
      await cachePersistor?.purge();
      await signOut({ callbackUrl: 'signOut' });
```

- [ ] **Step 4: Verify**

```bash
yarn lint:ts
yarn lint
yarn build
```

Expected: type check clean, build succeeds (persistence is prod-gated, so the build is the meaningful check). Then `rm -f public/sw.js public/sw.js.map`.

- [ ] **Step 5: Commit**

```bash
git add package.json yarn.lock src/lib/apollo/client.ts pages/logout.page.tsx
git commit -m "Persist Apollo cache to IndexedDB and purge it on logout"
```

---

### Task 6 (manual QA — user-assisted, not a sub-agent task)

- [ ] `ENABLE_SW=true yarn build && yarn serve`, log in, load contacts + tasks, then DevTools → Network → Offline:
  - Contacts list/detail and tasks list/detail still render (from cache)
  - Persistent "You are offline" warning appears; "back online" toast on reconnect
  - Attempting an edit shows the offline warning, not a raw error
  - No error-snackbar spam while navigating offline
  - Other routes (reports, etc.) degrade to error/empty states without crashing
- [ ] Airplane-mode test on a phone against the preview deploy
