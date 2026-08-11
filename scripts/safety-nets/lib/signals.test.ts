import { SIGNALS } from './signals';

describe('SIGNALS', () => {
  it.each(SIGNALS.map((signal) => [signal.key, signal] as const))(
    '%s caps recalibration above its floor',
    (_key, signal) => {
      expect(signal.thresholdConfig.maxCritical).toBeGreaterThan(
        signal.thresholdConfig.minCritical,
      );
    },
  );
});
