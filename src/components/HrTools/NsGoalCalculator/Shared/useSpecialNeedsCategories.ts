import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { NeedsCategory } from '../../Shared/GoalPresentation/SupportNeedsChart';
import { NsGoalCalculation } from './NsGoalCalculatorContext';

type Calculations = NsGoalCalculation['calculations'];

/** One special-needs cohort cost line. */
export interface SpecialNeedsCategory extends NeedsCategory {
  /** Optional worksheet description. */
  description?: string;
}

/**
 * Shared by the Special Needs worksheet table (Review step) and the Special
 * Needs chart (Presenting step) so their labels and amounts never drift.
 */
export const useSpecialNeedsCategories = (
  calculations: Calculations,
): SpecialNeedsCategory[] => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        title: t('IBS / NSO'),
        description: t('Tuition, Books, Housing, Food, Travel Expenses'),
        amount: calculations.ibsNsoCost,
      },
      {
        title: t('Faith & Finances Course'),
        amount: calculations.faithAndFinanceCost,
      },
      {
        title: t('Refresh Retreat'),
        description: t('Includes travel'),
        amount: calculations.refreshRetreatCost,
      },
      {
        title: t('Cru National Conference'),
        amount: calculations.cruConferenceCost,
      },
    ],
    [calculations, t],
  );
};
