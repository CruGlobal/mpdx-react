import { ThresholdConfig } from './signals';

export const percentile = (values: number[], p: number): number => {
  if (values.length === 0) {
    return 0;
  }

  const sorted = values.toSorted((a, b) => a - b);
  const rank = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(rank);
  const upper = Math.ceil(rank);
  const weight = rank - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};

const ceilExact = (value: number): number =>
  Math.ceil(Number(value.toPrecision(12)));

export interface Thresholds {
  warning: number;
  critical: number;
}

export const computeThresholds = (
  bucketValues: number[],
  config: ThresholdConfig,
): Thresholds => {
  if (bucketValues.length === 0) {
    throw new Error('empty baseline series: nothing to calibrate from');
  }
  const critical = Math.max(
    ceilExact(percentile(bucketValues, 99) * config.multiplier),
    config.minCritical,
  );
  if (critical > config.maxCritical) {
    throw new Error(
      `computed critical ${critical} exceeds maxCritical ${config.maxCritical}: ` +
        'the baseline is elevated or the cap is stale — investigate before regenerating',
    );
  }
  let warning = Math.max(
    ceilExact(percentile(bucketValues, 95) * config.multiplier),
    ceilExact(config.minCritical * 0.6),
  );
  if (warning >= critical) {
    warning = critical > 1000 ? Math.floor(critical * 0.8) : critical - 1;
  }
  return { warning, critical };
};
