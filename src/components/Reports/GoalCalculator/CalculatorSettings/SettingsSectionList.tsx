import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGoalCalculator } from '../Shared/GoalCalculatorContext';
import { getFamilySections } from '../Shared/familySections';
import { SectionList } from '../SharedComponents/SectionList';

export const SettingsSectionList: React.FC = () => {
  const { t } = useTranslation();
  const {
    goalCalculationResult: { data },
  } = useGoalCalculator();
  const specialFamily = data?.goalCalculation.specialFamily;

  const sections = [
    { title: t('Information'), complete: false },
    ...(specialFamily ? getFamilySections(specialFamily) : []),
  ];

  return <SectionList sections={sections} />;
};
