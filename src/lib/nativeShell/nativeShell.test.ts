import {
  mockCapacitorCore,
  setNativePlatform,
} from '__tests__/util/capacitorMocks';
import { getDevicePlatform, isNativeShell } from './nativeShell';

jest.mock('@capacitor/core', () => mockCapacitorCore);

describe('nativeShell', () => {
  describe('isNativeShell', () => {
    it.each([
      ['ios', true],
      ['android', true],
      ['web', false],
    ] as const)('returns %s -> %s', (platform, expected) => {
      setNativePlatform(platform);

      expect(isNativeShell()).toBe(expected);
    });
  });

  describe('getDevicePlatform', () => {
    it.each([
      ['ios', 'APNS'],
      ['android', 'GCM'],
      ['web', null],
    ] as const)('returns %s -> %s', (platform, expected) => {
      setNativePlatform(platform);

      expect(getDevicePlatform()).toBe(expected);
    });
  });
});
