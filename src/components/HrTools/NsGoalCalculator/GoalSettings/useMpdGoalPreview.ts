import { useEffect, useMemo, useState } from 'react';
import { useFormikContext } from 'formik';
import { NewStaffGoalCalculationAttributesInput } from 'src/graphql/types.generated';
import { useDebouncedValue } from 'src/hooks/useDebounce';
import { usePreviewNewStaffGoalCalculationMutation } from './NewStaffGoalCalculation.generated';
import { formValuesToAttributes } from './goalSettingsApiMapping';
import { GoalSettingsFormValues } from './goalSettingsFormValues';

/** Coalesce a burst of edits (e.g. picking through selects) into one request. */
export const PREVIEW_DEBOUNCE_MS = 500;

/**
 * A preview tagged with the attributes it was computed for. Every value is
 * `null` when the request failed.
 */
interface PreviewState {
  attributes: NewStaffGoalCalculationAttributesInput;
  monthlyGoal: number | null;
  salaryOverCap: boolean | null;
  debtOverCap: boolean | null;
}

interface UseMpdGoalPreviewArgs {
  /** `null` for a scenario goal, which has no account list. */
  accountListId: string | null;
  calculationId: string;
}

interface UseMpdGoalPreviewResult {
  /** True while a debounced edit's preview request is in flight. */
  calculating: boolean;
  /** True when the settled preview request failed. */
  failed: boolean;
  /** `null` when the form is clean or invalid, or the request is pending or failed. */
  previewGoal: number | null;
  /**
   * Unlike the goal, these are held across an in-flight or invalid edit, so a
   * warning doesn't blink off and re-announce itself on every keystroke.
   */
  previewSalaryOverCap: boolean | null;
  previewDebtOverCap: boolean | null;
}

/**
 * Recomputes the goal whenever the form has unsaved, valid edits, debounced so
 * it previews settled values rather than every keystroke. Consumers read the
 * result through the provider and fall back to their own saved value when no
 * preview applies.
 *
 * Keys off the Formik values rather than field blur, since some inputs
 * (selects) don't produce a usable blur.
 */
export const useMpdGoalPreview = ({
  accountListId,
  calculationId,
}: UseMpdGoalPreviewArgs): UseMpdGoalPreviewResult => {
  const { values, dirty, isValid } = useFormikContext<GoalSettingsFormValues>();

  const [preview, setPreview] = useState<PreviewState | null>(null);
  // `no-cache`: the preview returns a partial calculation under a throwaway
  // `NewStaffGoalCalculationPreview` type; keeping it out of the cache avoids
  // persisting an entity nothing else reads.
  const [previewMutation] = usePreviewNewStaffGoalCalculationMutation({
    fetchPolicy: 'no-cache',
  });

  // Formik keeps `values` referentially stable until a real edit (tabbing/blur
  // only touches `touched`), so this memoized object is stable too — its
  // identity doubles as the debounce key and the settled-preview match, no
  // serialization needed.
  const attributes = useMemo(() => formValuesToAttributes(values), [values]);
  // The attributes to preview, or `null` while the form is clean or invalid
  // (which also clears any prior preview).
  const previewable = dirty && isValid ? attributes : null;

  // Debounced so we preview the settled values, not every keystroke.
  const debounced = useDebouncedValue(previewable, PREVIEW_DEBOUNCE_MS);

  useEffect(() => {
    if (!dirty) {
      setPreview(null);
    }
  }, [dirty]);

  useEffect(() => {
    if (debounced === null) {
      return;
    }

    let active = true;
    previewMutation({
      variables: {
        input: {
          // Omitted for a scenario goal that has no account list.
          accountListId: accountListId ?? undefined,
          id: calculationId,
          attributes: debounced,
        },
      },
      context: { suppressErrors: true },
    })
      .then(({ data }) => {
        if (active) {
          const {
            monthlyGoal = null,
            salaryOverCap = null,
            debtOverCap = null,
          } = data?.previewNewStaffGoalCalculation?.newStaffGoalCalculation
            ?.calculations ?? {};
          setPreview({
            attributes: debounced,
            monthlyGoal,
            salaryOverCap,
            debtOverCap,
          });
        }
      })
      .catch(() => {
        // Record the failed attributes so the spinner stops and we fall back to
        // the saved goal and warnings.
        if (active) {
          setPreview({
            attributes: debounced,
            monthlyGoal: null,
            salaryOverCap: null,
            debtOverCap: null,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [debounced, accountListId, calculationId, previewMutation]);

  // The preview matches the current edits once their request has settled.
  const settledPreview =
    previewable !== null && preview?.attributes === previewable
      ? preview
      : null;
  // Edits are pending but their preview hasn't arrived yet.
  const calculating = previewable !== null && settledPreview === null;
  const failed = settledPreview !== null && settledPreview.monthlyGoal === null;

  const previewGoal = settledPreview?.monthlyGoal ?? null;
  const previewSalaryOverCap = dirty ? (preview?.salaryOverCap ?? null) : null;
  const previewDebtOverCap = dirty ? (preview?.debtOverCap ?? null) : null;

  return {
    calculating,
    failed,
    previewGoal,
    previewSalaryOverCap,
    previewDebtOverCap,
  };
};
