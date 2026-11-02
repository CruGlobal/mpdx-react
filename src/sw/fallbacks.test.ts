import { OFFLINE_PAGE_URL, fallbackEntries, isPageLoad } from './fallbacks';

const matches = (mode: RequestMode) =>
  isPageLoad({ request: { mode } as Request });

describe('fallbacks', () => {
  it('serves the offline page for a failed page load', () => {
    expect(matches('navigate')).toBe(true);
    expect(fallbackEntries).toEqual([
      { url: OFFLINE_PAGE_URL, matcher: isPageLoad },
    ]);
  });

  it.each<RequestMode>(['cors', 'same-origin', 'no-cors'])(
    'lets a failed %s request fail',
    (mode) => expect(matches(mode)).toBe(false),
  );
});
