import { useEffect, useMemo, useState } from 'react';
import { useFormikContext } from 'formik';
import { NewStaffGoalCalculationAttributesInput } from 'src/graphql/types.generated';
import { useDebouncedValue } from 'src/hooks/useDebounce';
import { usePreviewNewStaffGoalCalculationMutation } from './NewStaffGoalCalculation.generated';
import { formValuesToAttributes } from './goalSettingsApiMapping';
import { GoalSettingsFormValues } from './goalSettingsFormValues';

/** Coalesce a burst of edits (e.g. picking through selects) into one request. */
export const PREVIEW_DEBOUNCE_MS = 500;

/** Diffs smaller than half a cent are treated as no change. */
const CENT_EPSILON = 0.005;

/** The previewed goal, tagged with the attributes it was computed for. */
interface PreviewState {
  attributes: NewStaffGoalCalculationAttributesInput;
  /** Computed goal, or `null` if the preview request failed. */
  monthlyGoal: number | null;
}

interface UseMpdGoalPreviewArgs {
  /** Account list the goal belongs to, or `null` for a scenario goal. */
  accountListId: string | null;
  calculationId: string;
  savedMonthlyGoal: number;
}

interface UseMpdGoalPreviewResult {
  /** True while a debounced edit's preview request is in flight. */
  calculating: boolean;
  /** Goal to display: the previewed total when settled, else the saved goal. */
  displayGoal: number;
  /** Signed difference from the saved goal, rounded to cents (0 when unchanged). */
  diff: number;
  /** Whether the preview differs from the saved goal by at least a cent. */
  changed: boolean;
  /** True when the settled preview request failed (and fell back to the saved goal). */
  failed: boolean;
}

/**
 * Orchestrates the goal preview for {@link MpdGoalPreview}: watches the Goal
 * Settings form and, whenever the unsaved, valid form values change, debounces
 * a call to the API to recompute the goal (`previewNewStaffGoalCalculation`),
 * exposing the new total plus the signed difference from the saved goal.
 *
 * Previewing keys off the Formik values directly rather than field blur, since
 * some inputs (selects) don't produce a usable blur.
 */
export const useMpdGoalPreview = ({
  accountListId,
  calculationId,
  savedMonthlyGoal,
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
          setPreview({
            attributes: debounced,
            monthlyGoal:
              data?.previewNewStaffGoalCalculation?.newStaffGoalCalculation
                ?.calculations?.monthlyGoal ?? null,
          });
        }
      })
      .catch(() => {
        // Record the failed attributes so the spinner stops and we fall back to
        // the saved goal.
        if (active) {
          setPreview({ attributes: debounced, monthlyGoal: null });
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
  const displayGoal = previewGoal ?? savedMonthlyGoal;
  const diff =
    previewGoal === null
      ? 0
      : Math.round((previewGoal - savedMonthlyGoal) * 100) / 100;
  const changed = Math.abs(diff) >= CENT_EPSILON;

  return { calculating, displayGoal, diff, changed, failed };
};
