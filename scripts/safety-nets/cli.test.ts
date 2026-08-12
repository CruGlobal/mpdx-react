import { run } from './cli';
import { fetchBaselineSeries } from './lib/aggregate';
import { SIGNALS } from './lib/signals';

jest.mock('./lib/aggregate', () => ({
  fetchBaselineSeries: jest.fn(),
}));

jest.mock('@datadog/datadog-api-client', () => ({
  client: { createConfiguration: jest.fn(() => ({})) },
  v2: { RUMApi: jest.fn() },
}));

const mockFetchBaselineSeries = fetchBaselineSeries as jest.Mock;

const filledCounter = {
  series: Array.from({ length: 2689 }, (_, index) => (index < 787 ? 1 : 0)),
  observed: 787,
  expected: 2689,
};

const gauge = {
  series: [3.3e9, 4.2e9, 5.1e9],
  observed: 3,
  expected: 337,
};

const baselineSeries = (series: number[]) => ({
  series,
  observed: series.length,
  expected: series.length,
});

describe('run', () => {
  let stdout: jest.SpyInstance;
  let stderr: jest.SpyInstance;

  const stdoutText = () => stdout.mock.calls.map(([chunk]) => chunk).join('');
  const stderrText = () => stderr.mock.calls.map(([chunk]) => chunk).join('');

  beforeEach(() => {
    process.env.DATADOG_API_KEY = 'api-key';
    process.env.DATADOG_APP_KEY = 'app-key';
    mockFetchBaselineSeries.mockImplementation((_api, signal) =>
      Promise.resolve(signal.key === 'perf' ? gauge : filledCounter),
    );
    stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderr = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    delete process.env.DATADOG_API_KEY;
    delete process.env.DATADOG_APP_KEY;
    process.exitCode = undefined;
    jest.restoreAllMocks();
  });

  it('prints a pasteable threshold block covering every signal', async () => {
    await run();

    expect(stdoutText()).toBe(
      [
        '  # Regenerate by running `yarn safety-nets` in mpdx-react',
        '  rum_thresholds = {',
        '    error_impact = { warning = 4, critical = 6, window = "15m" }  # Calculated from 787/2689 buckets (71% empty)',
        '    frustration  = { warning = 18, critical = 30, window = "1h" } # Calculated from 787/2689 buckets (71% empty)',
        '    failed_api   = { warning = 4, critical = 6, window = "30m" }  # Calculated from 787/2689 buckets (71% empty)',
        '    perf         = { warning = 6012000000, critical = 6098400000, window = "2h" }',
        '  }',
        '',
      ].join('\n'),
    );
    expect(process.exitCode).toBeUndefined();
  });

  it('queries a 28-day lookback, inside the 30-day RUM retention window', async () => {
    await run();

    SIGNALS.forEach((signal) => {
      expect(mockFetchBaselineSeries).toHaveBeenCalledWith(
        expect.anything(),
        signal,
        28,
      );
    });
  });

  it('exits without calling Datadog when the API keys are missing', async () => {
    delete process.env.DATADOG_APP_KEY;

    await run();

    expect(stderrText()).toContain(
      'DATADOG_API_KEY and DATADOG_APP_KEY must be set',
    );
    expect(mockFetchBaselineSeries).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(2);
  });

  it('names every failing signal', async () => {
    mockFetchBaselineSeries.mockImplementation((_api, signal) =>
      signal.key === 'perf'
        ? Promise.reject(new Error('HTTP-Code: 403\nMessage: Forbidden'))
        : Promise.resolve(
            baselineSeries(Array.from({ length: 100 }, () => 1000)),
          ),
    );

    await run();

    expect(stderrText()).toContain(
      'errorImpact: computed critical 1500 exceeds maxCritical 12',
    );
    expect(stderrText()).toContain(
      'frustration: computed critical 1500 exceeds maxCritical 200',
    );
    expect(stderrText()).toContain(
      'failedApi: computed critical 2000 exceeds maxCritical 20',
    );
    expect(stderrText()).toContain('perf: HTTP-Code: 403');
    expect(process.exitCode).toBe(2);
    expect(stdoutText()).toBe('');
  });
});
