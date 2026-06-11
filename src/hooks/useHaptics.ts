import { useCallback } from 'react';
import { isNativeShell } from 'src/lib/nativeShell/nativeShell';

/**
 * The two haptic moments the shell supports (capacitor-shell.md §9 —
 * restraint over novelty): 'success' for completing a task, 'warning' for
 * confirming a destructive action.
 */
export type HapticFeedback = 'success' | 'warning';

interface UseHapticsResult {
  /**
   * Fires a notification haptic in the Capacitor shell; no-op in any browser.
   * Best-effort: never rejects, so callers can fire-and-forget.
   */
  triggerHaptic: (feedback: HapticFeedback) => Promise<void>;
}

export const useHaptics = (): UseHapticsResult => {
  const triggerHaptic = useCallback(
    async (feedback: HapticFeedback): Promise<void> => {
      if (!isNativeShell()) {
        return;
      }
      try {
        const { Haptics, NotificationType } = await import(
          /* webpackChunkName: "CapacitorHaptics" */ '@capacitor/haptics'
        );
        await Haptics.notification({
          type:
            feedback === 'success'
              ? NotificationType.Success
              : NotificationType.Warning,
        });
      } catch {
        // Haptics are best-effort polish — a plugin failure must never break
        // the user action that triggered the feedback.
      }
    },
    [],
  );

  return { triggerHaptic };
};
