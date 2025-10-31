import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGoalCalculator } from '../Shared/GoalCalculatorContext';
import {
  isInformationComplete,
  isSettingsComplete,
} from '../Shared/calculateCompletion';
import { getFamilySections } from '../Shared/familySections';
import { SectionList } from '../SharedComponents/SectionList';

export const SettingsSectionList: React.FC = () => {
  const { t } = useTranslation();
  const {
    goalCalculationResult: { data },
  } = useGoalCalculator();
  const goalCalculation = data?.goalCalculation;

  const sections = [
    { title: t('Settings'), complete: isSettingsComplete(goalCalculation) },
    {
      title: t('Information'),
      complete: isInformationComplete(goalCalculation),
    },
    ...(goalCalculation
      ? getFamilySections(goalCalculation.specialFamily)
      : []),
  ];

  return <SectionList sections={sections} />;
};
