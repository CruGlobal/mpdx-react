import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CircularProgress, Stack, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { NewStaffGoalCalculationAttributesInput } from 'src/graphql/types.generated';
import { useDebouncedValue } from 'src/hooks/useDebounce';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { usePreviewNewStaffGoalCalculationMutation } from './NewStaffGoalCalculation.generated';
import { formValuesToAttributes } from './goalSettingsApiMapping';
import { GoalSettingsFormValues } from './goalSettingsFormValues';

/** Coalesce blurs from tabbing quickly through several fields into one request. */
export const PREVIEW_DEBOUNCE_MS = 500;

/** The previewed goal keyed by the attributes it was computed for. */
interface PreviewState {
  attributesKey: string;
  /** Computed goal, or `null` if the preview request failed. */
  monthlyGoal: number | null;
}

interface MpdGoalPreviewProps {
  /**
   * Account list the goal belongs to, or `null` for a scenario goal that has no
   * account list. Omitted from the preview request when null — the API previews
   * a scenario goal without it.
   */
  accountListId: string | null;
  calculationId: string;
  /** The saved goal total; shown when there are no goal-affecting edits. */
  savedMonthlyGoal: number;
}

/**
 * MPD Goal figure in the header. When a field is blurred with unsaved, valid
 * edits it asks the API to recompute the goal (`previewNewStaffGoalCalculation`)
 * and shows the new total plus the signed difference from the saved goal
 * (e.g. `+$200.00` / `-$75.00`) so coaches and admins can see the impact of a
 * change before saving. Preview runs on blur, not on every keystroke.
 */
export const MpdGoalPreview: React.FC<MpdGoalPreviewProps> = ({
  accountListId,
  calculationId,
  savedMonthlyGoal,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { values, dirty, isValid } = useFormikContext<GoalSettingsFormValues>();

  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [previewMutation] = usePreviewNewStaffGoalCalculationMutation();

  const liveAttributesKey = useMemo(
    () => JSON.stringify(formValuesToAttributes(values)),
    [values],
  );
  // The attributes key to commit when a field blurs, or `null` when the form
  // isn't previewable. Held in a ref so the blur listener reads the latest
  // without re-subscribing.
  const committableKeyRef = useRef<string | null>(null);
  committableKeyRef.current = dirty && isValid ? liveAttributesKey : null;

  // Attributes committed for preview — updated only when a field blurs, so the
  // preview reflects the last-blurred state rather than every keystroke.
  const [committedKey, setCommittedKey] = useState<string | null>(null);

  useEffect(() => {
    // The editable fields are siblings of this component, not descendants, so
    // React's `onBlur` can't see them. `focusout` bubbles to the document, so
    // listen there.
    const handleFocusOut = () => {
      setCommittedKey(committableKeyRef.current);
    };
    document.addEventListener('focusout', handleFocusOut);
    return () => document.removeEventListener('focusout', handleFocusOut);
  }, []);

  // Drop the preview once the form is clean again (saved or cancelled).
  useEffect(() => {
    if (!dirty) {
      setCommittedKey(null);
    }
  }, [dirty]);

  const debouncedKey = useDebouncedValue(committedKey, PREVIEW_DEBOUNCE_MS);

  useEffect(() => {
    if (debouncedKey === null) {
      return;
    }

    let active = true;
    previewMutation({
      variables: {
        input: {
          // Omitted for a scenario goal that has no account list.
          accountListId: accountListId ?? undefined,
          id: calculationId,
          attributes: JSON.parse(
            debouncedKey,
          ) as NewStaffGoalCalculationAttributesInput,
        },
      },
      context: { suppressErrors: true },
    })
      .then(({ data }) => {
        if (active) {
          setPreview({
            attributesKey: debouncedKey,
            monthlyGoal:
              data?.previewNewStaffGoalCalculation?.newStaffGoalCalculation
                .calculations.monthlyGoal ?? null,
          });
        }
      })
      .catch(() => {
        // Record the failed key so the spinner stops and we fall back to the saved goal.
        if (active) {
          setPreview({ attributesKey: debouncedKey, monthlyGoal: null });
        }
      });

    return () => {
      active = false;
    };
  }, [debouncedKey, accountListId, calculationId, previewMutation]);

  // The preview matches the committed edits once their request has settled.
  const settledPreview =
    committedKey !== null && preview?.attributesKey === committedKey
      ? preview
      : null;
  // A blur committed new edits but their preview hasn't arrived yet.
  const calculating = committedKey !== null && !settledPreview;

  const previewGoal = settledPreview?.monthlyGoal ?? null;
  const displayGoal = previewGoal ?? savedMonthlyGoal;
  const diff =
    previewGoal === null
      ? 0
      : Math.round((previewGoal - savedMonthlyGoal) * 100) / 100;
  const changed = Math.abs(diff) >= 0.005;
  const sign = diff > 0 ? '+' : '-';
  const diffLabel =
    sign +
    currencyFormat(Math.abs(diff), 'USD', locale, {
      showTrailingZeros: true,
    });

  // While recalculating, swap the amount for a spinner and hide the difference,
  // so no stale number is on screen mid-update.
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 3 }}>
      <Typography variant="h6">
        {calculating
          ? t('MPD Goal:')
          : t('MPD Goal: {{amount}}', {
              amount: currencyFormat(displayGoal, 'USD', locale, {
                showTrailingZeros: true,
              }),
            })}
      </Typography>
      {calculating ? (
        <CircularProgress
          size={16}
          aria-label={t('Calculating new goal total')}
        />
      ) : (
        changed && (
          <Typography
            variant="h6"
            component="span"
            sx={{ color: 'text.secondary' }}
            aria-label={t('Unsaved changes will adjust goal by {{diff}}', {
              diff: diffLabel,
            })}
          >
            {diffLabel}
          </Typography>
        )
      )}
    </Stack>
  );
};
