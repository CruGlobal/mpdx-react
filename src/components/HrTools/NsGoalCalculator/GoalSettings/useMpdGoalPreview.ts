import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFormikContext } from 'formik';
import { NewStaffGoalCalculationAttributesInput } from 'src/graphql/types.generated';
import { useDebouncedValue } from 'src/hooks/useDebounce';
import { usePreviewNewStaffGoalCalculationMutation } from './NewStaffGoalCalculation.generated';
import { formValuesToAttributes } from './goalSettingsApiMapping';
import { GoalSettingsFormValues } from './goalSettingsFormValues';

/** Coalesce blurs from tabbing quickly through several fields into one request. */
export const PREVIEW_DEBOUNCE_MS = 500;

/** Diffs smaller than half a cent are treated as no change. */
const CENT_EPSILON = 0.005;

/** Attributes committed for preview, plus a stable key for deduping/debouncing. */
interface CommittedAttributes {
  key: string;
  attributes: NewStaffGoalCalculationAttributesInput;
}

/** The previewed goal keyed by the attributes it was computed for. */
interface PreviewState {
  key: string;
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
  /**
   * Attach to the element wrapping the preview. Used to find the enclosing form
   * so blur detection is scoped to it rather than the whole document.
   */
  containerRef: React.RefObject<HTMLDivElement>;
  /** True while a committed edit's preview request is in flight. */
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
 * Orchestrates the on-blur goal preview for {@link MpdGoalPreview}: watches the
 * Goal Settings form, and when a field is blurred with unsaved, valid edits it
 * asks the API to recompute the goal (`previewNewStaffGoalCalculation`) and
 * exposes the new total plus the signed difference from the saved goal. Preview
 * runs on blur (debounced), not on every keystroke.
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

  const attributes = useMemo(() => formValuesToAttributes(values), [values]);
  const attributesKey = useMemo(() => JSON.stringify(attributes), [attributes]);

  // The attributes to commit when a field blurs, or `null` when the form isn't
  // previewable. Held in a ref (mirrored in an effect) so the blur listener
  // reads the latest without re-subscribing.
  const committableRef = useRef<CommittedAttributes | null>(null);
  useEffect(() => {
    committableRef.current =
      dirty && isValid ? { key: attributesKey, attributes } : null;
  }, [dirty, isValid, attributesKey, attributes]);

  // Attributes committed for preview — updated only when a field blurs, so the
  // preview reflects the last-blurred state rather than every keystroke.
  const [committed, setCommitted] = useState<CommittedAttributes | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // The editable fields are siblings of this component, not descendants, so
    // React's `onBlur` can't see them. `focusout` bubbles, so listen on the
    // enclosing form (falling back to the document) — scoped, not global.
    const target = containerRef.current?.closest('form') ?? document;
    const handleFocusOut = () => setCommitted(committableRef.current);
    target.addEventListener('focusout', handleFocusOut);
    return () => target.removeEventListener('focusout', handleFocusOut);
  }, []);

  // Drop the preview once the form is clean again (saved or cancelled).
  useEffect(() => {
    if (!dirty) {
      setCommitted(null);
    }
  }, [dirty]);

  const debounced = useDebouncedValue(committed, PREVIEW_DEBOUNCE_MS);

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
          attributes: debounced.attributes,
        },
      },
      context: { suppressErrors: true },
    })
      .then(({ data }) => {
        if (active) {
          setPreview({
            key: debounced.key,
            monthlyGoal:
              data?.previewNewStaffGoalCalculation?.newStaffGoalCalculation
                ?.calculations?.monthlyGoal ?? null,
          });
        }
      })
      .catch(() => {
        // Record the failed key so the spinner stops and we fall back to the
        // saved goal.
        if (active) {
          setPreview({ key: debounced.key, monthlyGoal: null });
        }
      });

    return () => {
      active = false;
    };
  }, [debounced, accountListId, calculationId, previewMutation]);

  // The preview matches the committed edits once their request has settled.
  const settledPreview =
    committed !== null && preview?.key === committed.key ? preview : null;
  // A blur committed new edits but their preview hasn't arrived yet.
  const calculating = committed !== null && settledPreview === null;
  const failed = settledPreview !== null && settledPreview.monthlyGoal === null;

  const previewGoal = settledPreview?.monthlyGoal ?? null;
  const displayGoal = previewGoal ?? savedMonthlyGoal;
  const diff =
    previewGoal === null
      ? 0
      : Math.round((previewGoal - savedMonthlyGoal) * 100) / 100;
  const changed = Math.abs(diff) >= CENT_EPSILON;

  return { containerRef, calculating, displayGoal, diff, changed, failed };
};
