import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import {
  PageRoute,
  findMismatches,
  pageFileToRoute,
  parseAllowlist,
  parseMapRoutes,
  routeForms,
  run,
} from './check-route-map';

const mapWithRows = (...rows: string[]): string =>
  [
    '# MPDX App Map',
    '',
    '## 1. Global layout',
    '',
    '| URL | Page |',
    '| --- | --- |',
    '| `/ignoredOutsideRouteMap` | Ignored |',
    '',
    '## 2. Route map',
    '',
    'All account-list pages start with `/accountLists/{accountListId}`.',
    '',
    '| URL | Page | Purpose | Main actions |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
    '## 3. URL state, filters, and views',
    '',
    '| `/alsoIgnored` | Ignored |',
  ].join('\n');

const page = (file: string): PageRoute => {
  const route = pageFileToRoute(file);
  if (!route) {
    throw new Error(`${file} is not a route`);
  }
  return route;
};

describe('pageFileToRoute', () => {
  it('converts dynamic segments to placeholders', () => {
    expect(
      pageFileToRoute(
        'accountLists/[accountListId]/coaching/[coachingId].page.tsx',
      ),
    ).toEqual({
      file: 'accountLists/[accountListId]/coaching/[coachingId].page.tsx',
      route: '/accountLists/{accountListId}/coaching/{coachingId}',
    });
  });

  it('drops index', () => {
    expect(pageFileToRoute('index.page.tsx')?.route).toBe('/');
    expect(
      pageFileToRoute(
        'accountLists/[accountListId]/hrTools/goalCalculator/index.page.tsx',
      )?.route,
    ).toBe('/accountLists/{accountListId}/hrTools/goalCalculator');
  });

  it('turns an optional catch-all into an optional trailing param', () => {
    expect(
      pageFileToRoute(
        'accountLists/[accountListId]/tasks/[[...contactId]].page.tsx',
      ),
    ).toMatchObject({
      route: '/accountLists/{accountListId}/tasks',
      optionalParam: 'contactId',
    });
  });

  it('turns a required catch-all into a placeholder', () => {
    expect(pageFileToRoute('docs/[...slug].page.tsx')?.route).toBe(
      '/docs/{slug}',
    );
  });

  it('accepts every page extension Next is configured for', () => {
    expect(pageFileToRoute('login.page.ts')?.route).toBe('/login');
  });

  it('skips api routes and Next internals', () => {
    expect(pageFileToRoute('api/graphql.page.ts')).toBeNull();
    expect(pageFileToRoute('_app.page.tsx')).toBeNull();
    expect(pageFileToRoute('_document.page.tsx')).toBeNull();
    expect(pageFileToRoute('_error.page.tsx')).toBeNull();
  });
});

describe('routeForms', () => {
  it('lists the route with and without an optional trailing param', () => {
    expect(routeForms(page('reports/[[...contactId]].page.tsx'))).toEqual([
      '/reports',
      '/reports/{contactId}',
    ]);
    expect(routeForms(page('[[...slug]].page.tsx'))).toEqual(['/', '/{slug}']);
  });

  it('lists only the route when there is no optional param', () => {
    expect(routeForms(page('login.page.tsx'))).toEqual(['/login']);
  });
});

describe('parseMapRoutes', () => {
  it('reads only the route map section', () => {
    expect(
      parseMapRoutes(mapWithRows('| `/login` | Sign In | x | y |')),
    ).toEqual(['/login']);
  });

  it('expands the account list prefix, including the bare root', () => {
    expect(
      parseMapRoutes(
        mapWithRows(
          '| `...` (account list root) | Dashboard | x | y |',
          '| `.../contacts/{contactId}` | Contacts | x | y |',
        ),
      ),
    ).toEqual([
      '/accountLists/{accountListId}',
      '/accountLists/{accountListId}/contacts/{contactId}',
    ]);
  });

  it('reads a redirect row with two absolute routes', () => {
    expect(
      parseMapRoutes(
        mapWithRows(
          '| `/account_lists/{id}/accept_invite/{inviteId}` and `/organizations/{orgId}/accept_invite/{inviteId}` | (redirect) | Legacy invite links. | none |',
        ),
      ),
    ).toEqual([
      '/account_lists/{id}/accept_invite/{inviteId}',
      '/organizations/{orgId}/accept_invite/{inviteId}',
    ]);
  });

  it('appends suffixes that follow an account list route', () => {
    expect(
      parseMapRoutes(
        mapWithRows(
          '| `.../hrTools/goalCalculator` and `/{goalCalculationId}` | MPD Goal Calculator | x |',
          '| `.../hrTools/mpdGoalAdmin` (plus `/scenario/{id}` and `/staff/{id}`) | Admin | x |',
        ),
      ),
    ).toEqual([
      '/accountLists/{accountListId}/hrTools/goalCalculator',
      '/accountLists/{accountListId}/hrTools/goalCalculator/{goalCalculationId}',
      '/accountLists/{accountListId}/hrTools/mpdGoalAdmin',
      '/accountLists/{accountListId}/hrTools/mpdGoalAdmin/scenario/{id}',
      '/accountLists/{accountListId}/hrTools/mpdGoalAdmin/staff/{id}',
    ]);
  });

  it('strips query strings, ignores other columns, and dedupes', () => {
    expect(
      parseMapRoutes(
        mapWithRows(
          '| `.../settings/preferences?setup=...` | Preferences | Uses `/elsewhere`. | Save |',
          '| `.../settings/preferences` | Preferences | x | y |',
        ),
      ),
    ).toEqual(['/accountLists/{accountListId}/settings/preferences']);
  });

  it('throws when the route map section is missing or empty', () => {
    expect(() => parseMapRoutes('# Map\n\n## 1. Other\n')).toThrow(
      'no "## 2. Route map" section',
    );
    expect(() => parseMapRoutes(mapWithRows())).toThrow('no route rows');
  });
});

describe('findMismatches', () => {
  const pages = [
    page('login.page.tsx'),
    page('accountLists/[accountListId]/contacts/[[...contactId]].page.tsx'),
    page('accountLists/[accountListId]/reports/[financialAccountId].page.tsx'),
  ];

  it('passes when every page and row match', () => {
    expect(
      findMismatches(
        pages,
        [
          '/login',
          '/accountLists/{accountListId}/contacts',
          '/accountLists/{accountListId}/contacts/{contactId}',
          '/accountLists/{accountListId}/reports/{id}',
        ],
        [],
      ),
    ).toEqual({ missingFromMap: [], missingPage: [], staleAllowlist: [] });
  });

  it('matches an optional catch-all page by either of its forms', () => {
    expect(
      findMismatches(
        [page('tools/appeal/[[...appealId]].page.tsx')],
        ['/tools/appeal/{appealId}'],
        [],
      ).missingFromMap,
    ).toEqual([]);
  });

  it('reports pages missing from the map and rows with no page', () => {
    expect(
      findMismatches(
        pages,
        ['/login', '/accountLists/{accountListId}/contacts', '/logout'],
        [],
      ),
    ).toEqual({
      missingFromMap: [
        '/accountLists/{accountListId}/reports/{financialAccountId}',
      ],
      missingPage: ['/logout'],
      staleAllowlist: [],
    });
  });

  it('skips allowlisted routes and reports allowlist entries that match nothing', () => {
    expect(
      findMismatches(
        pages,
        ['/login', '/accountLists/{accountListId}/contacts', '/logout'],
        [
          {
            route: '/accountLists/{accountListId}/reports/{financialAccountId}',
            reason: 'missing from app map, regenerate map',
          },
          { route: '/logout', reason: 'map row has no page' },
          { route: '/gone', reason: 'legacy redirect' },
        ],
      ),
    ).toEqual({
      missingFromMap: [],
      missingPage: [],
      staleAllowlist: ['/gone'],
    });
  });
});

describe('parseAllowlist', () => {
  it('reads route and reason entries', () => {
    expect(
      parseAllowlist('[{ "route": "/404", "reason": "error page" }]'),
    ).toEqual([{ route: '/404', reason: 'error page' }]);
  });

  it('rejects entries without a reason', () => {
    expect(() => parseAllowlist('[{ "route": "/404" }]')).toThrow(
      'with a reason for each',
    );
    expect(() =>
      parseAllowlist('[{ "route": "/404", "reason": " " }]'),
    ).toThrow('with a reason for each');
    expect(() => parseAllowlist('{}')).toThrow('with a reason for each');
  });
});

describe('run', () => {
  let dir: string;
  let stdout: jest.SpyInstance;
  let stderr: jest.SpyInstance;

  const write = (file: string, contents = '') => {
    mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    writeFileSync(path.join(dir, file), contents);
  };
  const runIn = () =>
    run([
      '--pages',
      path.join(dir, 'pages'),
      '--map',
      path.join(dir, 'map.md'),
      '--allow',
      path.join(dir, 'allow.json'),
    ]);

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'route-map-'));
    write('pages/login.page.tsx');
    write('pages/_app.page.tsx');
    write('pages/api/graphql.page.ts');
    write('pages/tasks/[[...contactId]].page.tsx');
    write('pages/tasks/helpers.ts');
    write('allow.json', '[]');
    stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderr = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    stdout.mockRestore();
    stderr.mockRestore();
    process.exitCode = undefined;
  });

  it('passes when pages and map agree', () => {
    write('map.md', mapWithRows('| `/login` | x |', '| `/tasks` | x |'));
    runIn();

    expect(process.exitCode).toBeUndefined();
    expect(stdout).toHaveBeenCalledWith(
      'Route map check passed: 2 pages, 2 map routes.\n',
    );
  });

  it('exits 1 and lists the mismatches', () => {
    write('map.md', mapWithRows('| `/login` | x |', '| `/logout` | x |'));
    runIn();

    expect(process.exitCode).toBe(1);
    const output = stderr.mock.calls.map(([chunk]) => chunk).join('');
    expect(output).toContain('Pages missing from the app map:\n  /tasks\n');
    expect(output).toContain('App map rows with no page:\n  /logout\n');
  });

  it('exits 2 when a file cannot be read', () => {
    runIn();

    expect(process.exitCode).toBe(2);
  });
});
