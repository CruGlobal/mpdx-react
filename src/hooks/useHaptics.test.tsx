import { renderHook } from '@testing-library/react';
import {
  mockCapacitorCore,
  mockHaptics,
  setNativePlatform,
} from '__tests__/util/capacitorMocks';
import { useHaptics } from './useHaptics';

jest.mock('@capacitor/core', () => mockCapacitorCore);
// requireActual would load the real plugin, which imports @capacitor/core
// before the mocks above initialize — so re-declare the tiny enum inline.
jest.mock('@capacitor/haptics', () => ({
  Haptics: mockHaptics,
  NotificationType: { Success: 'SUCCESS', Warning: 'WARNING', Error: 'ERROR' },
}));

describe('useHaptics', () => {
  beforeEach(() => {
    setNativePlatform('web');
  });

  it('is a no-op on web', async () => {
    const { result } = renderHook(() => useHaptics());

    await result.current.triggerHaptic('success');

    expect(mockHaptics.notification).not.toHaveBeenCalled();
  });

  it.each([
    ['success', 'SUCCESS'],
    ['warning', 'WARNING'],
  ] as const)(
    'fires a %s notification haptic in the native shell',
    async (feedback, expectedType) => {
      setNativePlatform('ios');
      const { result } = renderHook(() => useHaptics());

      await result.current.triggerHaptic(feedback);

      expect(mockHaptics.notification).toHaveBeenCalledWith({
        type: expectedType,
      });
    },
  );

  it('never rejects when the haptics plugin fails', async () => {
    setNativePlatform('android');
    mockHaptics.notification.mockRejectedValueOnce(
      new Error('not implemented'),
    );
    const { result } = renderHook(() => useHaptics());

    await expect(
      result.current.triggerHaptic('warning'),
    ).resolves.toBeUndefined();
  });
});
