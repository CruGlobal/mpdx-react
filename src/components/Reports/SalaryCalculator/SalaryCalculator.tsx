import React from 'react';
import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { PanelLayout } from '../Shared/CalculationReports/PanelLayout/PanelLayout';
import { useIconPanelItems } from '../Shared/CalculationReports/PanelLayout/useIconPanelItems';
import { PanelTypeEnum } from '../Shared/CalculationReports/Shared/sharedTypes';
import { StepsList } from '../Shared/CalculationReports/StepsList/StepsList';
import { CurrentStep } from './CurrentStep';
import {
  SalaryCalculatorProvider,
  useSalaryCalculator,
} from './SalaryCalculatorContext/SalaryCalculatorContext';
import { StepNavigation } from './StepNavigation/StepNavigation';

const MainContent: React.FC = () => {
  const { steps, handlePreviousStep, handleNextStep, currentIndex } =
    useSalaryCalculator();

  return (
    <Stack gap={4} maxWidth={800}>
      <CurrentStep />
      <StepNavigation
        onBack={handlePreviousStep}
        onContinue={handleNextStep}
        isBackDisabled={currentIndex === 0}
        isContinueDisabled={currentIndex === steps.length - 1}
      />
    </Stack>
  );
};

export const SalaryCalculator: React.FC = () => (
  <SalaryCalculatorProvider>
    <SalaryCalculatorContent />
  </SalaryCalculatorProvider>
);

export const SalaryCalculatorContent: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  const { isDrawerOpen, toggleDrawer, steps, percentComplete, currentIndex } =
    useSalaryCalculator();

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Other}
      percentComplete={percentComplete}
      steps={steps}
      currentIndex={currentIndex}
      icons={useIconPanelItems(isDrawerOpen, toggleDrawer)}
      sidebarContent={<StepsList steps={steps} />}
      sidebarTitle={t('Form Steps')}
      isSidebarOpen={isDrawerOpen}
      sidebarAriaLabel={t('Salary Calculator Sections')}
      mainContent={<MainContent />}
      backHref={`/accountLists/${accountListId}`}
    />
  );
};
