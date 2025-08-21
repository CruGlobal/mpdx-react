import React from 'react';
import { useCalculatorSettings } from '../../CalculatorSettings/CalculatorSettings';
import { SectionList } from '../../SharedComponents/SectionList';

export const SettingsSectionList: React.FC = () => {
  const calculatorSettings = useCalculatorSettings();

  return (
    <SectionList
      sections={
        calculatorSettings.categories.map((category) => ({
          title: category.title,
          complete: false,
        })) ?? []
      }
    />
  );
};
