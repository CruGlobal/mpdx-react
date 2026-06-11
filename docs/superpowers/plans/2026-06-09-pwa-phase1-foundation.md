# PWA Phase 1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the unmaintained next-pwa v5 service worker stack with Serwist, fix the web app manifest, add an offline fallback page, and add a user-visible service-worker update prompt.

**Architecture:** `@serwist/next` wraps the Next.js config and compiles `src/service-worker/index.ts` to `public/sw.js` at build time, precaching build assets and falling back to a static `/offline` page when a navigation fails. Auto-registration is disabled (`register: false`); a small client component registers the SW via `@serwist/window` and shows a notistack snackbar when a new SW version is waiting, activating it (`messageSkipWaiting`) on user confirmation. The SW keeps `skipWaiting: false` so updates never activate mid-session without consent.

**Tech Stack:** Next.js 15 (Pages Router), TypeScript, `@serwist/next` + `serwist` + `@serwist/window` (v9), MUI v5, notistack v2, react-i18next, Jest + React Testing Library.

**Repo context the engineer must know:**

- Package manager is **yarn** (`yarn add`, `yarn remove`). Never npm.
- Pages live in `pages/` with the `.page.tsx` suffix (enforced via `pageExtensions`). Pages use `export default` (Next.js requirement); all other components use **named exports only**.
- All user-visible strings go through `useTranslation()` / `t('...')`.
- Tests are colocated (`Foo.test.tsx` next to `Foo.tsx`).
- `next.config.ts` currently composes plugins with the deprecated `next-compose-plugins`; this plan removes it.
- `.gitignore` already ignores `/public/sw*` and `/public/workbox*` — the built SW is never committed.
- `pages/_app.page.tsx` throws if a page renders without a session unless the route is listed in its `nonAuthenticatedPages` set.

---

### Task 1: Fix `manifest.json` and add Amplify cache headers for the service worker

**Files:**
- Modify: `public/manifest.json`
- Create: `customHttp.yml` (repo root — AWS Amplify custom headers file)

- [ ] **Step 1: Replace the manifest content**

Replace the entire content of `public/manifest.json` with (fixes invalid `"Scope"` key casing, removes the non-standard `splash_pages` key, adds `id`, `description`, `orientation`, `categories`; icons unchanged):

```json
{
  "id": "/",
  "name": "MPDX",
  "short_name": "MPDX",
  "description": "Fundraising software built for ministries, missionaries and churches.",
  "theme_color": "#05699b",
  "background_color": "#05699b",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "orientation": "any",
  "categories": ["productivity", "business"],
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

- [ ] **Step 2: Validate the JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('public/manifest.json','utf8')); console.log('valid')"`
Expected: `valid`

- [ ] **Step 3: Create `customHttp.yml`**

Create `customHttp.yml` at the repo root (AWS Amplify Hosting reads this file for custom headers; a cached `sw.js` blocks all future SW updates, so it must never be cached):

```yaml
customHeaders:
  - pattern: '/sw.js'
    headers:
      - key: 'Cache-Control'
        value: 'no-cache, no-store, must-revalidate'
  - pattern: '/manifest.json'
    headers:
      - key: 'Cache-Control'
        value: 'public, max-age=0, must-revalidate'
```

- [ ] **Step 4: Commit**

```bash
git add public/manifest.json customHttp.yml
git commit -m "Fix manifest.json keys and prevent sw.js caching on Amplify"
```

---

### Task 2: Offline fallback page

**Files:**
- Create: `pages/offline.page.tsx`
- Create: `pages/offline.test.tsx`
- Modify: `pages/_app.page.tsx` (line 73, the `nonAuthenticatedPages` set)

The page must be static (NO `getServerSideProps`) so the service worker can precache it. It is modeled on `pages/404.page.tsx` — read that file first to see the pattern (`StatusPageWrapper`, `BaseLayout`, `getAppName`).

- [ ] **Step 1: Write the failing test**

Create `pages/offline.test.tsx`:

```tsx
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import Offline from './offline.page';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <Offline />
  </ThemeProvider>
);

describe('Offline page', () => {
  it('renders the offline message', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('You are offline.')).toBeInTheDocument();
    expect(
      getByText(
        'This page is not available offline. Check your internet connection and try again.',
      ),
    ).toBeInTheDocument();
  });

  it('reloads the page when Try Again is clicked', async () => {
    const reload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload },
      writable: true,
    });

    const { getByRole } = render(<TestComponent />);

    await userEvent.click(getByRole('button', { name: 'Try Again' }));
    expect(reload).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test offline.test.tsx`
Expected: FAIL — cannot find module `./offline.page`

- [ ] **Step 3: Create the page**

Create `pages/offline.page.tsx`:

```tsx
import Head from 'next/head';
import React, { ReactElement } from 'react';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import BaseLayout from 'src/components/Layouts/Basic';
import { getAppName } from 'src/lib/getAppName';
import { StatusPageWrapper } from './styledComponents/StatusPageWrapper';

const Offline = (): ReactElement => {
  const appName = getAppName();
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>{`${t('Offline')} | ${appName}`}</title>
      </Head>

      <StatusPageWrapper boxShadow={3}>
        <Box mb={2}>
          <WifiOffIcon fontSize="large" color="disabled" />
        </Box>
        <Typography variant="h5">{t('You are offline.')}</Typography>
        <Typography>
          {t(
            'This page is not available offline. Check your internet connection and try again.',
          )}
        </Typography>
        <Box sx={{ padding: 1, display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={() => window.location.reload()}>
            {t('Try Again')}
          </Button>
        </Box>
      </StatusPageWrapper>
    </>
  );
};

Offline.layout = BaseLayout;

export default Offline;
```

Note: pages use `export default` (Next.js requirement — this is the documented exception to the named-exports rule). The `.layout = BaseLayout` assignment matches the `PageWithLayout` pattern in `_app.page.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test offline.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Allow the page to render without a session**

In `pages/_app.page.tsx`, find (line ~73):

```tsx
const nonAuthenticatedPages = new Set(['/login', '/404', '/500']);
```

Change to:

```tsx
const nonAuthenticatedPages = new Set(['/login', '/404', '/500', '/offline']);
```

This is required: `_app.page.tsx` throws "A session was not provided via page props" for any route not in this set, and the offline fallback is served from the SW cache without a session.

- [ ] **Step 6: Run lint and commit**

```bash
yarn lint
git add pages/offline.page.tsx pages/offline.test.tsx pages/_app.page.tsx
git commit -m "Add offline fallback page for PWA navigation failures"
```

---

### Task 3: Replace next-pwa with Serwist

**Files:**
- Modify: `package.json` (via yarn commands, not hand-editing)
- Modify: `next.config.ts`
- Create: `src/service-worker/index.ts`
- Modify: `tsconfig.json` (line 4, `lib` array)

- [ ] **Step 1: Swap dependencies**

```bash
yarn remove next-pwa next-compose-plugins
yarn add @serwist/next serwist @serwist/window
```

Expected: success; `package.json` no longer lists `next-pwa` or `next-compose-plugins`, and lists the three Serwist packages at ^9.x.

Note: `next-compose-plugins` is only used by `next.config.ts` (verified by grep) — removing it is safe once Step 3 lands.

- [ ] **Step 2: Add `webworker` to tsconfig lib**

In `tsconfig.json` line 4, change:

```json
    "lib": ["dom", "esnext"],
```

to:

```json
    "lib": ["dom", "esnext", "webworker"],
```

- [ ] **Step 3: Rewrite the plugin composition in `next.config.ts`**

Replace the imports at the top (remove `next-compose-plugins` and `next-pwa`):

```ts
import { spawnSync } from 'node:child_process';
import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';
import withSerwistInit from '@serwist/next';
import withOptimizedImages from 'next-optimized-images';
```

After the `const prod = process.env.NODE_ENV === 'production';` line, add:

```ts
// A revision versions the precached /offline page so a new deploy
// invalidates the previously precached copy.
const revision =
  (
    spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).stdout ?? ''
  ).trim() || crypto.randomUUID();

const withSerwist = withSerwistInit({
  swSrc: 'src/service-worker/index.ts',
  swDest: 'public/sw.js',
  // Registration is handled manually by ServiceWorkerUpdatePrompt so we can
  // show an update prompt instead of silently activating new versions
  register: false,
  // Set ENABLE_SW=true to test the service worker in a local dev/build
  disable: !prod && process.env.ENABLE_SW !== 'true',
  additionalPrecacheEntries: [{ url: '/offline', revision }],
});
```

In the `env` block of `config` (around line 88, next to `DISABLE_NEW_REPORTS`), add:

```ts
    ENABLE_SW: process.env.ENABLE_SW,
```

Replace the final export (currently `module.exports = withPlugins([...])`, lines 173-187) with plain nesting:

```ts
module.exports = withSerwist(withOptimizedImages(withBundleAnalyzer(config)));
```

Everything else in `next.config.ts` (env block, webpack fn, redirects, etc.) stays unchanged.

- [ ] **Step 4: Create the service worker source**

Create `src/service-worker/index.ts`:

```ts
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // skipWaiting stays false so a new service worker never takes over
  // mid-session; ServiceWorkerUpdatePrompt asks the user first
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

// Delete precaches left behind by the previous next-pwa/workbox service
// worker; Serwist uses its own precache name and would otherwise leave the
// old ones taking up storage forever
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('workbox-precache'))
          .map((key) => caches.delete(key)),
      ),
    ),
  );
});

serwist.addEventListeners();
```

If `yarn lint` complains about `self` or the `declare global` block in this file, prefer fixing via an ESLint override for `src/service-worker/**` (env: `serviceworker`) rather than inline disables.

- [ ] **Step 5: Type check**

Run: `yarn lint:ts`
Expected: no NEW errors (run `git stash && yarn lint:ts` to capture the baseline first if unsure, then `git stash pop`).

- [ ] **Step 6: Verify the production build emits the service worker**

Run: `yarn build` (requires the existing `.env`; GraphQL types must already be generated — run `yarn gql` first if `src/graphql` artifacts are missing)
Expected: build succeeds; `ls public/sw.js` shows the file; `grep -c offline public/sw.js` ≥ 1 (the precache entry).

Then clean up: `rm -f public/sw.js public/swe-worker*` (they are gitignored, but keep the tree clean).

- [ ] **Step 7: Commit**

```bash
git add package.json yarn.lock next.config.ts tsconfig.json src/service-worker/index.ts
git commit -m "Replace unmaintained next-pwa with Serwist for service worker generation"
```

---

### Task 4: Service worker registration + update prompt

**Files:**
- Create: `src/components/ServiceWorker/ServiceWorkerUpdatePrompt.tsx`
- Create: `src/components/ServiceWorker/ServiceWorkerUpdatePrompt.test.tsx`
- Modify: `pages/_app.page.tsx` (render the component inside `SnackbarProvider`)

Depends on Task 3 (needs `@serwist/window` installed and `register: false`).

- [ ] **Step 1: Write the failing test**

Create `src/components/ServiceWorker/ServiceWorkerUpdatePrompt.test.tsx`:

```tsx
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ServiceWorkerUpdatePrompt } from './ServiceWorkerUpdatePrompt';

const mockRegister = jest.fn().mockResolvedValue(undefined);
const mockMessageSkipWaiting = jest.fn();
const listeners: Record<string, () => void> = {};

jest.mock('@serwist/window', () => ({
  Serwist: jest.fn().mockImplementation(() => ({
    register: mockRegister,
    messageSkipWaiting: mockMessageSkipWaiting,
    addEventListener: (event: string, callback: () => void) => {
      listeners[event] = callback;
    },
  })),
}));

const TestComponent: React.FC = () => (
  <SnackbarProvider>
    <ServiceWorkerUpdatePrompt />
  </SnackbarProvider>
);

describe('ServiceWorkerUpdatePrompt', () => {
  beforeEach(() => {
    process.env.ENABLE_SW = 'true';
    Object.defineProperty(window.navigator, 'serviceWorker', {
      value: {},
      configurable: true,
    });
    Object.keys(listeners).forEach((key) => delete listeners[key]);
  });

  afterEach(() => {
    delete process.env.ENABLE_SW;
  });

  it('registers the service worker', async () => {
    render(<TestComponent />);

    await waitFor(() => expect(mockRegister).toHaveBeenCalled());
  });

  it('does not register when the service worker is disabled', () => {
    delete process.env.ENABLE_SW;

    render(<TestComponent />);

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows an update prompt when a new service worker is waiting and activates it on click', async () => {
    const { findByRole } = render(<TestComponent />);

    await waitFor(() => expect(listeners.waiting).toBeDefined());
    listeners.waiting();

    const updateButton = await findByRole('button', { name: 'Update' });
    await userEvent.click(updateButton);

    expect(mockMessageSkipWaiting).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test ServiceWorkerUpdatePrompt.test.tsx`
Expected: FAIL — cannot find module `./ServiceWorkerUpdatePrompt`

- [ ] **Step 3: Create the component**

Create `src/components/ServiceWorker/ServiceWorkerUpdatePrompt.tsx`:

```tsx
import React, { useEffect, useRef } from 'react';
import { Button } from '@mui/material';
import { Serwist } from '@serwist/window';
import { SnackbarKey, useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

export const ServiceWorkerUpdatePrompt: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  // Avoid double registration from React strict mode re-running effects
  const registeredRef = useRef(false);

  useEffect(() => {
    const swEnabled =
      process.env.NODE_ENV === 'production' ||
      process.env.ENABLE_SW === 'true';
    if (
      !swEnabled ||
      registeredRef.current ||
      !('serviceWorker' in navigator)
    ) {
      return;
    }
    registeredRef.current = true;

    const serwist = new Serwist('/sw.js', { scope: '/', type: 'classic' });

    serwist.addEventListener('waiting', () => {
      serwist.addEventListener('controlling', () => {
        window.location.reload();
      });

      enqueueSnackbar(t('A new version of the app is available.'), {
        persist: true,
        action: (key: SnackbarKey) => (
          <Button
            color="inherit"
            onClick={() => {
              closeSnackbar(key);
              serwist.messageSkipWaiting();
            }}
          >
            {t('Update')}
          </Button>
        ),
      });
    });

    void serwist.register();
  }, [enqueueSnackbar, closeSnackbar, t]);

  return null;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test ServiceWorkerUpdatePrompt.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Render it in `_app.page.tsx`**

In `pages/_app.page.tsx`:

Add the import (alphabetical order with the other `src/components` imports):

```tsx
import { ServiceWorkerUpdatePrompt } from 'src/components/ServiceWorker/ServiceWorkerUpdatePrompt';
```

Inside the `SnackbarProvider` (it must be a descendant of `SnackbarProvider` because it calls `useSnackbar`), directly after `<GlobalStyles />`:

```tsx
<SnackbarProvider maxSnack={3}>
  <GlobalStyles />
  <ServiceWorkerUpdatePrompt />
```

- [ ] **Step 6: Run lint + the app-level tests and commit**

```bash
yarn lint
yarn test ServiceWorkerUpdatePrompt.test.tsx
git add src/components/ServiceWorker pages/_app.page.tsx
git commit -m "Register service worker manually with a user-visible update prompt"
```

---

### Task 5: iOS installed-PWA meta tags + apple-touch-icon size fixes

**Files:**
- Modify: `pages/_app.page.tsx` (the `<Head>` block, lines ~145-176)

The existing apple-touch-icon links have wrong `sizes` attributes (e.g. `sizes="60x60"` pointing at the 76x76 file). Fix the sizes to match the actual files and add the installed-PWA meta tags.

- [ ] **Step 1: Fix the icon links and add meta tags**

In the `<Head>` block of `pages/_app.page.tsx`, replace this block:

```tsx
        <link
          rel="apple-touch-icon"
          href="/icons/apple-touch-icon-iphone-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/icons/apple-touch-icon-ipad-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/icons/apple-touch-icon-iphone-retina-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/icons/apple-touch-icon-ipad-retina-152x152.png"
        />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
```

with:

```tsx
        <link
          rel="apple-touch-icon"
          href="/icons/apple-touch-icon-iphone-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/icons/apple-touch-icon-ipad-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/icons/apple-touch-icon-iphone-retina-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/apple-touch-icon-ipad-retina-152x152.png"
        />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-title"
          content={process.env.APP_NAME ?? 'MPDX'}
        />
```

- [ ] **Step 2: Lint and commit**

```bash
yarn lint
git add pages/_app.page.tsx
git commit -m "Add installed-PWA meta tags and fix apple-touch-icon sizes"
```

---

### Final verification (after all tasks)

- [ ] `yarn lint:ci` — passes
- [ ] `yarn lint:ts` — no new errors vs. main
- [ ] `yarn test` — full suite passes
- [ ] `ENABLE_SW=true yarn build && yarn serve` — app loads, DevTools → Application shows `sw.js` activated, manifest valid (no warnings), going offline (DevTools Network → Offline) and navigating to an uncached route shows the `/offline` page
- [ ] Clean up build artifacts: `rm -f public/sw.js public/swe-worker*`
