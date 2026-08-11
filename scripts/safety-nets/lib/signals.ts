const BASE_SCOPE = 'env:production service:mpdx-web-react @session.type:user';

// Quote-free: cru-terraform embeds this in a `rum("...")` query. Keep in sync.
export const NOISE_EXCLUSION_CLAUSE =
  '-@error.message:(*ydration* OR *server-rendered* OR *Script\\ error* OR *ResizeObserver*)';

export type SignalKey = 'errorImpact' | 'frustration' | 'failedApi' | 'perf';

export type MonitorWindow = '15m' | '30m' | '1h' | '2h';

export interface SignalRollup {
  aggregation: 'cardinality' | 'count' | 'pc75';
  facet?: string;
}

export interface ThresholdConfig {
  /** Headroom over the baseline: critical = p99 × multiplier, warning = p95 × multiplier */
  multiplier: number;
  /** Human-decided recalibration threshold */
  minCritical: number;
  /** Human-decided recalibration threshold */
  maxCritical: number;
}

export interface Signal {
  key: SignalKey;
  searchQuery: string;
  rollup: SignalRollup;
  monitorWindow: MonitorWindow;
  thresholdConfig: ThresholdConfig;
}

export const SIGNALS: Signal[] = [
  {
    key: 'errorImpact',
    searchQuery: `@type:error ${BASE_SCOPE} ${NOISE_EXCLUSION_CLAUSE}`,
    rollup: { aggregation: 'cardinality', facet: '@usr.id' },
    monitorWindow: '15m',
    thresholdConfig: {
      multiplier: 1.5,
      minCritical: 6,
      maxCritical: 12,
    },
  },
  {
    key: 'frustration',
    searchQuery: `@type:action ${BASE_SCOPE} @action.frustration.type:(rage_click OR error_click)`,
    rollup: { aggregation: 'count' },
    monitorWindow: '1h',
    thresholdConfig: {
      multiplier: 1.5,
      minCritical: 30,
      maxCritical: 200,
    },
  },
  {
    key: 'failedApi',
    searchQuery: `${BASE_SCOPE} ((@type:error @context.mpdxErrorType:(graphql OR graphql_network)) OR (@type:resource @resource.status_code:>=500))`,
    rollup: { aggregation: 'count' },
    monitorWindow: '30m',
    thresholdConfig: {
      multiplier: 2,
      minCritical: 15,
      maxCritical: 60,
    },
  },
  {
    key: 'perf',
    searchQuery: `@type:view ${BASE_SCOPE}`,
    rollup: { aggregation: 'pc75', facet: '@view.largest_contentful_paint' },
    monitorWindow: '2h',
    thresholdConfig: {
      multiplier: 1.2,
      // LCP in nanoseconds
      minCritical: 5_000_000_000,
      maxCritical: 8_000_000_000,
    },
  },
];

export const signalByKey = (key: SignalKey): Signal => {
  const signal = SIGNALS.find((candidate) => candidate.key === key);
  if (!signal) {
    throw new Error(`Unknown signal: ${key}`);
  }
  return signal;
};
