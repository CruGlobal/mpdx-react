import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { getAppName } from 'src/lib/getAppName';
import { missingValue } from '../../../Shared/helpers/missingValue';
import { useCurrentMonthlyGoalQuery } from './CurrentMonthlyGoal.generated';
import { ReferenceCard, formatGoalAmount } from './ReferenceCard';

export const CurrentMonthlyGoalCard: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const accountListId = useAccountListId();
  const { data, error } = useCurrentMonthlyGoalQuery({
    variables: { accountListId },
  });

  const formatCurrentGoal = (): string | undefined => {
    if (!data) {
      return error ? missingValue : undefined;
    }
    const monthlyGoal = data.accountList.settings?.monthlyGoal;
    // A goal of 0 is not a real goal, so treat it like a blank one
    return monthlyGoal ? formatGoalAmount(monthlyGoal, locale) : t('Not set');
  };

  return (
    <ReferenceCard
      title={t('Current Monthly Goal')}
      caption={t('From your {{appName}} settings', {
        appName: getAppName(),
      })}
      value={formatCurrentGoal()}
    />
  );
};
