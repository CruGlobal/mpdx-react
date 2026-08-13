import { v2 } from '@datadog/datadog-api-client';
import { MonitorWindow, Signal } from './signals';

const WINDOW_MINUTES: Record<MonitorWindow, number> = {
  '15m': 15,
  '30m': 30,
  '1h': 60,
  '2h': 120,
};

export interface BaselineSeries {
  /** Zero-filled to the full grid for counters; left as-is for gauges. */
  series: number[];
  /** Buckets Datadog actually returned, before any zero-fill. */
  observed: number;
  /** Buckets the lookback should produce at the signal's window. */
  expected: number;
}

export const parseTimeseriesBuckets = (
  response: v2.RUMAnalyticsAggregateResponse,
): number[] => {
  const buckets = response.data?.buckets ?? [];
  return buckets.flatMap((bucket) => {
    const compute = bucket.computes?.['c0'];
    if (!Array.isArray(compute)) {
      throw new Error(
        `expected a timeseries compute for c0, got ${JSON.stringify(compute)}`,
      );
    }
    return compute.map((point) => point.value ?? 0);
  });
};

export const fetchBaselineSeries = async (
  api: v2.RUMApi,
  signal: Signal,
  lookbackDays: number,
): Promise<BaselineSeries> => {
  const response = await api.aggregateRUMEvents({
    body: {
      compute: [
        {
          aggregation: signal.rollup.aggregation,
          ...(signal.rollup.facet ? { metric: signal.rollup.facet } : {}),
          interval: signal.monitorWindow,
          type: 'timeseries',
        },
      ],
      filter: {
        query: signal.searchQuery,
        from: `now-${lookbackDays}d`,
        to: 'now',
      },
    },
  });
  const values = parseTimeseriesBuckets(response);
  const expected =
    Math.round(
      (lookbackDays * 24 * 60) / WINDOW_MINUTES[signal.monitorWindow],
    ) + 1;

  if (values.length === 0) {
    throw new Error(
      `Datadog returned no buckets over ${lookbackDays}d — the query matches nothing: ${signal.searchQuery}`,
    );
  }

  // Datadog omits empty buckets but the monitor evaluates them as real 0s, so
  // restore them; for a gauge a missing bucket means "no measurement", not zero.
  if (signal.rollup.aggregation === 'pc75') {
    return { series: values, observed: values.length, expected };
  }
  const missing = Math.max(0, expected - values.length);
  return {
    series: values.concat(new Array(missing).fill(0)),
    observed: values.length,
    expected,
  };
};
