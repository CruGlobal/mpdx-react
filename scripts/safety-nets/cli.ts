import { client, v2 } from '@datadog/datadog-api-client';
import { getErrorMessage } from 'src/lib/error';
import { camelToSnake } from 'src/lib/snakeToCamel';
import { fetchBaselineSeries } from './lib/aggregate';
import { MonitorWindow, SIGNALS } from './lib/signals';
import { Thresholds, computeThresholds } from './lib/stats';

const LOOKBACK_DAYS = 28; // under Datadog's 30d RUM retention

interface ThresholdRow extends Thresholds {
  key: string;
  window: MonitorWindow;
  observed: number;
  expected: number;
  zeroFilled: boolean;
}

// Highlight mostly-empty data that reviewers should be cautious about
const renderCoverage = ({ observed, expected }: ThresholdRow): string => {
  const empty = Math.round(((expected - observed) / expected) * 100);
  return `# Calculated from ${observed}/${expected} buckets (${empty}% empty)`;
};

const renderThresholdsHcl = (rows: ThresholdRow[]): string => {
  // Pre-aligned so the paste is already `terraform fmt` clean.
  const keyWidth = Math.max(...rows.map((row) => row.key.length));
  const attributes = rows.map(
    ({ key, warning, critical, window }) =>
      `    ${key.padEnd(keyWidth)} = { warning = ${warning}, critical = ${critical}, window = "${window}" }`,
  );
  const maxAttributeWidth = attributes.reduce(
    (max, line, index) =>
      rows[index].zeroFilled ? Math.max(max, line.length) : max,
    0,
  );

  return [
    `  # Regenerate by running \`yarn safety-nets\` in mpdx-react`,
    `  rum_thresholds = {`,
    ...attributes.map((line, index) =>
      rows[index].zeroFilled
        ? `${line} ${' '.repeat(maxAttributeWidth - line.length)}${renderCoverage(rows[index])}`
        : line,
    ),

    `  }`,
    '',
  ].join('\n');
};

const baseline = async (): Promise<void> => {
  const { DATADOG_API_KEY, DATADOG_APP_KEY } = process.env;
  if (!DATADOG_API_KEY || !DATADOG_APP_KEY) {
    throw new Error('DATADOG_API_KEY and DATADOG_APP_KEY must be set');
  }

  const api = new v2.RUMApi(
    client.createConfiguration({
      authMethods: {
        apiKeyAuth: DATADOG_API_KEY,
        appKeyAuth: DATADOG_APP_KEY,
      },
    }),
  );

  const fetched = await Promise.allSettled(
    SIGNALS.map((signal) => fetchBaselineSeries(api, signal, LOOKBACK_DAYS)),
  );

  const thresholds: ThresholdRow[] = [];
  const failures: string[] = [];

  SIGNALS.forEach((signal, index) => {
    const result = fetched[index];
    if (result.status === 'rejected') {
      failures.push(`${signal.key}: ${getErrorMessage(result.reason)}`);
      return;
    }

    const { series, observed, expected } = result.value;
    try {
      thresholds.push({
        key: camelToSnake(signal.key),
        window: signal.monitorWindow,
        observed,
        expected,
        // Gauges are left unfilled, so their gaps aren't zeros in the series.
        zeroFilled: series.length > observed,
        ...computeThresholds(series, signal.thresholdConfig),
      });
    } catch (error) {
      failures.push(`${signal.key}: ${getErrorMessage(error)}`);
    }
  });

  if (failures.length > 0) {
    throw new Error(failures.join('\n'));
  }

  process.stdout.write(renderThresholdsHcl(thresholds));
  process.stderr.write(
    '\nPaste the block above over rum_thresholds in cru-terraform applications/mpdx/web-react/datadog.tf and open a PR.\n',
  );
};

export const run = async (): Promise<void> => {
  try {
    await baseline();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.stack : error}\n`);
    // exitCode, not process.exit: lets stderr finish flushing into pipes.
    process.exitCode = 2;
  }
};

if (require.main === module) {
  run();
}
