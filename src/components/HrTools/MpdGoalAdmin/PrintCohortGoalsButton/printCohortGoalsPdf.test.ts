import { downloadPdf, fetchCohortGoalsPdf } from './printCohortGoalsPdf';

const downloadUrl = 'https://api.mpdx.org/exports/token-1.pdf';

const originalFetch = global.fetch;
const originalCreateObjectURL = window.URL.createObjectURL;
const originalRevokeObjectURL = window.URL.revokeObjectURL;

// jest.config.js sets clearMocks but not restoreMocks, so anything put on a global has to be put back by hand.
afterEach(() => {
  global.fetch = originalFetch;
  window.URL.createObjectURL = originalCreateObjectURL;
  window.URL.revokeObjectURL = originalRevokeObjectURL;
  jest.restoreAllMocks();
});

describe('fetchCohortGoalsPdf', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    global.fetch = fetchMock;
    window.URL.createObjectURL = jest.fn().mockReturnValue('blob:goals-pdf');
  });

  it('redeems the download URL with a bearer token and returns a blob URL', async () => {
    const blob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
    fetchMock.mockResolvedValue({ ok: true, blob: async () => blob });

    expect(await fetchCohortGoalsPdf(downloadUrl, 'api-token')).toBe(
      'blob:goals-pdf',
    );
    expect(fetchMock).toHaveBeenCalledWith(downloadUrl, {
      headers: { authorization: 'Bearer api-token' },
      signal: expect.any(AbortSignal),
    });
    expect(window.URL.createObjectURL).toHaveBeenCalledWith(blob);
  });

  // A JWT in the query string would land in browser history, bookmarks and proxy logs.
  it('never puts the token in the URL', async () => {
    fetchMock.mockResolvedValue({ ok: true, blob: async () => new Blob([]) });

    await fetchCohortGoalsPdf(downloadUrl, 'api-token');

    expect(fetchMock.mock.calls[0][0]).not.toContain('api-token');
  });

  it('rejects on a failed response rather than downloading an error body', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(fetchCohortGoalsPdf(downloadUrl, 'api-token')).rejects.toThrow(
      '403',
    );
    expect(window.URL.createObjectURL).not.toHaveBeenCalled();
  });

  // Without this the button spins forever while the server renders the whole cohort.
  it('aborts and rejects once the render passes the timeout', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation(
      (_url, { signal }) =>
        new Promise((_resolve, reject) =>
          signal.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          ),
        ),
    );

    const pending = fetchCohortGoalsPdf(downloadUrl, 'api-token');
    jest.advanceTimersByTime(120_000); // matches the module's two-minute budget
    jest.useRealTimers();

    await expect(pending).rejects.toThrow('timed out');
  });
});

describe('downloadPdf', () => {
  it('saves the blob under the given filename and revokes the URL', () => {
    const anchor = document.createElement('a');
    anchor.click = jest.fn();
    jest.spyOn(document, 'createElement').mockReturnValue(anchor);
    window.URL.revokeObjectURL = jest.fn();

    downloadPdf('blob:goals-pdf', 'MPD Goals - Fall NSO 2026.pdf');

    expect(anchor.download).toBe('MPD Goals - Fall NSO 2026.pdf');
    expect(anchor.href).toContain('blob:goals-pdf');
    expect(anchor.click).toHaveBeenCalled();
    // Leaking the object URL would pin the whole PDF in memory for the tab's life.
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:goals-pdf');
  });
});
