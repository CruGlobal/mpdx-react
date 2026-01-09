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

const MainContent: React.FC = () => (
  <Stack gap={4} maxWidth={800}>
    <CurrentStep />
    <StepNavigation />
  </Stack>
);

export const SalaryCalculator: React.FC = () => (
  <SalaryCalculatorProvider>
    <SalaryCalculatorContent />
  </SalaryCalculatorProvider>
);

export const SalaryCalculatorContent: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { steps, currentIndex, percentComplete, isDrawerOpen, toggleDrawer } =
    useSalaryCalculator();

  const iconPanelItems = useIconPanelItems(isDrawerOpen, toggleDrawer);

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Other}
      percentComplete={percentComplete}
      steps={steps}
      currentIndex={currentIndex}
      icons={iconPanelItems}
      sidebarContent={<StepsList steps={steps} />}
      sidebarTitle={t('Form Steps')}
      isSidebarOpen={isDrawerOpen}
      sidebarAriaLabel={t('Salary Calculator Sections')}
      mainContent={<MainContent />}
      backHref={`/accountLists/${accountListId}/reports/salaryCalculator`}
    />
  );
};
