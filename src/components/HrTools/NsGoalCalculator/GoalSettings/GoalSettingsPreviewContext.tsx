import React, { createContext, useContext, useMemo } from 'react';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { GoalSettingsFormValues } from './goalSettingsFormValues';
import {
  GoalSettingsWarningItem,
  WarningSeverity,
  buildGoalSettingsWarnings,
  getFieldSeverity,
} from './goalSettingsWarnings';
import { useMpdGoalPreview } from './useMpdGoalPreview';

interface GoalSettingsPreviewValue {
  calculating: boolean;
  failed: boolean;
  previewGoal: number | null;
  warnings: GoalSettingsWarningItem[];
  fieldSeverity: (name: string) => WarningSeverity | undefined;
}

const GoalSettingsPreviewContext =
  createContext<GoalSettingsPreviewValue | null>(null);

interface GoalSettingsPreviewProviderProps {
  /** `null` for a scenario goal, which has no account list. */
  accountListId: string | null;
  calculationId: string;
  /** The over-cap flags on the saved record; used until a preview settles. */
  savedSalaryOverCap: boolean;
  savedDebtOverCap: boolean;
  children?: React.ReactNode;
}

/**
 * Owns the Goal Settings preview for the whole form. Every consumer — the goal
 * figure, the warnings, the field outlines — reads from here, so an edit costs
 * one request no matter how many are mounted, and they can't disagree mid-flight.
 *
 * Must render inside the `<Formik>`, since the preview keys off live values.
 */
export const GoalSettingsPreviewProvider: React.FC<
  GoalSettingsPreviewProviderProps
> = ({
  accountListId,
  calculationId,
  savedSalaryOverCap,
  savedDebtOverCap,
  children,
}) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<GoalSettingsFormValues>();
  const {
    calculating,
    failed,
    previewGoal,
    previewSalaryOverCap,
    previewDebtOverCap,
  } = useMpdGoalPreview({ accountListId, calculationId });

  const salaryOverCap = previewSalaryOverCap ?? savedSalaryOverCap;
  const debtOverCap = previewDebtOverCap ?? savedDebtOverCap;

  const value = useMemo<GoalSettingsPreviewValue>(() => {
    const warnings = buildGoalSettingsWarnings({
      values,
      salaryOverCap,
      debtOverCap,
      t,
    });

    return {
      calculating,
      failed,
      previewGoal,
      warnings,
      fieldSeverity: (name) => getFieldSeverity(warnings, name),
    };
  }, [values, salaryOverCap, debtOverCap, t, calculating, failed, previewGoal]);

  return (
    <GoalSettingsPreviewContext.Provider value={value}>
      {children}
    </GoalSettingsPreviewContext.Provider>
  );
};

/** `null` outside a provider, so standalone fields just skip highlighting. */
export const useGoalSettingsPreview = (): GoalSettingsPreviewValue | null =>
  useContext(GoalSettingsPreviewContext);
