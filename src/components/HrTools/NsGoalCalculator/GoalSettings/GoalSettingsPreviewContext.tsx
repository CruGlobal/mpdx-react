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
import { NewStaffGoalCalculation } from './useNewStaffGoalCalculation';

type PreviewCalculations = Pick<
  NewStaffGoalCalculation['calculations'],
  'contributing403bAmount' | 'spouseContributing403bAmount' | 'specialNeedsLeft'
>;

interface GoalSettingsPreviewValue {
  calculating: boolean;
  failed: boolean;
  previewGoal: number | null;
  previewCalculations: PreviewCalculations;
  warnings: GoalSettingsWarningItem[];
  fieldSeverity: (name: string) => WarningSeverity | undefined;
}

const GoalSettingsPreviewContext =
  createContext<GoalSettingsPreviewValue | null>(null);

interface GoalSettingsPreviewProviderProps {
  /** `null` for a scenario goal, which has no account list. */
  accountListId: string | null;
  calculation: NewStaffGoalCalculation;
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
> = ({ accountListId, calculation, children }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<GoalSettingsFormValues>();

  const { id: calculationId, calculations: savedCalculations } = calculation;

  const {
    calculating,
    failed,
    previewGoal,
    previewLineItems,
    previewSalaryOverCap,
    previewDebtOverCap,
  } = useMpdGoalPreview({ accountListId, calculationId });

  const previewCalculations = useMemo<PreviewCalculations>(
    () => ({
      contributing403bAmount:
        previewLineItems?.contributing403bAmount ??
        savedCalculations.contributing403bAmount,
      spouseContributing403bAmount:
        previewLineItems?.spouseContributing403bAmount ??
        savedCalculations.spouseContributing403bAmount,
      specialNeedsLeft:
        previewLineItems?.specialNeedsLeft ??
        savedCalculations.specialNeedsLeft,
    }),
    [savedCalculations, previewLineItems],
  );
  const salaryOverCap = previewSalaryOverCap ?? savedCalculations.salaryOverCap;
  const debtOverCap = previewDebtOverCap ?? savedCalculations.debtOverCap;

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
      previewCalculations,
      warnings,
      fieldSeverity: (name) => getFieldSeverity(warnings, name),
    };
  }, [
    values,
    salaryOverCap,
    debtOverCap,
    t,
    calculating,
    failed,
    previewGoal,
    previewCalculations,
  ]);

  return (
    <GoalSettingsPreviewContext.Provider value={value}>
      {children}
    </GoalSettingsPreviewContext.Provider>
  );
};

/** `null` outside a provider, so standalone fields just skip highlighting. */
export const useGoalSettingsPreview = (): GoalSettingsPreviewValue | null =>
  useContext(GoalSettingsPreviewContext);
