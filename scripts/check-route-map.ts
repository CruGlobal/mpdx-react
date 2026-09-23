import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import { parseArgs } from 'util';

const REPO_ROOT = path.join(__dirname, '..');
const DEFAULT_MAP = 'src/components/Assistant/knowledge/mpdx-app-map.md';
const DEFAULT_ALLOWLIST = 'scripts/route-map-allowlist.json';
const DEFAULT_PAGES = 'pages';

const ACCOUNT_LIST_PREFIX = '/accountLists/{accountListId}';
const ROUTE_MAP_HEADING = /^## 2\. Route map\s*$/;
const PAGE_EXTENSION = /\.page\.(tsx|ts|jsx|js)$/;
const NON_ROUTE_PAGES = new Set(['_app', '_document', '_error']);

export interface PageRoute {
  file: string;
  route: string;
  optionalParam?: string;
}

export interface AllowlistEntry {
  route: string;
  reason: string;
}

export interface Mismatches {
  missingFromMap: string[];
  missingPage: string[];
  staleAllowlist: string[];
}

const toPlaceholder = (segment: string): string =>
  segment.replace(/^\[(?:\.\.\.)?(\w+)\]$/, '{$1}');

// file is relative to the pages directory, for example "accountLists/[accountListId]/tasks/[[...contactId]].page.tsx"
export const pageFileToRoute = (file: string): PageRoute | null => {
  const segments = file.replace(PAGE_EXTENSION, '').split('/');
  if (segments[0] === 'api' || NON_ROUTE_PAGES.has(segments[0])) {
    return null;
  }
  if (segments[segments.length - 1] === 'index') {
    segments.pop();
  }

  const optionalMatch = segments[segments.length - 1]?.match(
    /^\[\[\.\.\.(\w+)\]\]$/,
  );
  if (optionalMatch) {
    segments.pop();
  }

  return {
    file,
    route: '/' + segments.map(toPlaceholder).join('/'),
    ...(optionalMatch && { optionalParam: optionalMatch[1] }),
  };
};

export const routeForms = ({ route, optionalParam }: PageRoute): string[] =>
  optionalParam
    ? [route, `${route === '/' ? '' : route}/{${optionalParam}}`]
    : [route];

const expandPrefix = (code: string): string =>
  code.startsWith('...') ? ACCOUNT_LIST_PREFIX + code.slice(3) : code;

const parseRouteCell = (cell: string): string[] => {
  const codes = [...cell.matchAll(/`([^`]+)`/g)].map(([, code]) =>
    code.replace(/\?.*$/, ''),
  );
  if (codes.length === 0) {
    return [];
  }

  const [first, ...rest] = codes;
  const base = expandPrefix(first);
  // After an account list route, a bare "/x" is a suffix of it, as in "`.../hrTools/goalCalculator` and `/{goalCalculationId}`"
  const suffixesExtendBase = first.startsWith('...');
  return [
    base,
    ...rest.map((code) =>
      code.startsWith('...')
        ? expandPrefix(code)
        : suffixesExtendBase
          ? base + code
          : code,
    ),
  ].filter((route) => route.startsWith('/'));
};

export const parseMapRoutes = (markdown: string): string[] => {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => ROUTE_MAP_HEADING.test(line));
  if (start === -1) {
    throw new Error('App map has no "## 2. Route map" section');
  }
  const end = lines.findIndex(
    (line, index) => index > start && line.startsWith('## '),
  );

  const routes = new Set<string>();
  lines
    .slice(start + 1, end === -1 ? undefined : end)
    .filter((line) => line.trim().startsWith('|'))
    .forEach((line) => {
      const firstCell = line.trim().split('|')[1] ?? '';
      parseRouteCell(firstCell).forEach((route) => routes.add(route));
    });

  if (routes.size === 0) {
    throw new Error('App map route section has no route rows');
  }
  return [...routes];
};

export const parseAllowlist = (json: string): AllowlistEntry[] => {
  const entries: unknown = JSON.parse(json);
  if (
    !Array.isArray(entries) ||
    !entries.every(
      (entry) =>
        typeof entry?.route === 'string' &&
        typeof entry?.reason === 'string' &&
        entry.reason.trim() !== '',
    )
  ) {
    throw new Error(
      'Allowlist must be an array of { route, reason } entries with a reason for each',
    );
  }
  return entries;
};

// The map and pages/ name the same parameter differently ({id} versus [financialAccountId]), so compare shapes only
const routeKey = (route: string): string => route.replace(/\{[^}]*\}/g, '{}');

export const findMismatches = (
  pages: PageRoute[],
  mapRoutes: string[],
  allowlist: AllowlistEntry[],
): Mismatches => {
  const mapKeys = new Set(mapRoutes.map(routeKey));
  const pageKeys = new Set(pages.flatMap(routeForms).map(routeKey));
  const allowKeys = new Set(allowlist.map(({ route }) => routeKey(route)));
  const usedAllowKeys = new Set<string>();

  const unlessAllowed = (route: string): boolean => {
    const key = routeKey(route);
    if (allowKeys.has(key)) {
      usedAllowKeys.add(key);
      return false;
    }
    return true;
  };

  const missingFromMap = pages
    .filter(
      (page) => !routeForms(page).some((form) => mapKeys.has(routeKey(form))),
    )
    .map(({ route }) => route)
    .filter(unlessAllowed);
  const missingPage = mapRoutes
    .filter((route) => !pageKeys.has(routeKey(route)))
    .filter(unlessAllowed);
  const staleAllowlist = allowlist
    .map(({ route }) => route)
    .filter((route) => !usedAllowKeys.has(routeKey(route)));

  return { missingFromMap, missingPage, staleAllowlist };
};

export const listPageFiles = (pagesDir: string): string[] =>
  readdirSync(pagesDir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && PAGE_EXTENSION.test(entry.name))
    .map((entry) =>
      path
        .relative(pagesDir, path.join(entry.parentPath, entry.name))
        .split(path.sep)
        .join('/'),
    )
    .sort();

const formatList = (title: string, routes: string[]): string =>
  routes.length
    ? `${title}\n${routes.map((route) => `  ${route}`).join('\n')}\n`
    : '';

const check = (argv: string[]): boolean => {
  const { values } = parseArgs({
    args: argv,
    options: {
      map: { type: 'string', default: DEFAULT_MAP },
      allow: { type: 'string', default: DEFAULT_ALLOWLIST },
      pages: { type: 'string', default: DEFAULT_PAGES },
    },
  });
  const resolve = (file: string) => path.resolve(REPO_ROOT, file);

  const pages = listPageFiles(resolve(values.pages))
    .map(pageFileToRoute)
    .filter((page): page is PageRoute => page !== null);
  const mapRoutes = parseMapRoutes(readFileSync(resolve(values.map), 'utf8'));
  const allowlist = parseAllowlist(readFileSync(resolve(values.allow), 'utf8'));

  const { missingFromMap, missingPage, staleAllowlist } = findMismatches(
    pages,
    mapRoutes,
    allowlist,
  );
  const report = [
    formatList('Pages missing from the app map:', missingFromMap),
    formatList('App map rows with no page:', missingPage),
    formatList(
      'Allowlist entries that no longer match a mismatch (remove them):',
      staleAllowlist,
    ),
  ].join('');

  if (report) {
    process.stderr.write(
      `${report}\nRefresh ${values.map} from mpdx-assistant, or add a route with a reason to ${values.allow}.\n`,
    );
    return false;
  }
  process.stdout.write(
    `Route map check passed: ${pages.length} pages, ${mapRoutes.length} map routes.\n`,
  );
  return true;
};

export const run = (argv: string[] = process.argv.slice(2)): void => {
  try {
    if (!check(argv)) {
      process.exitCode = 1;
    }
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
    process.exitCode = 2;
  }
};

if (require.main === module) {
  run();
}
