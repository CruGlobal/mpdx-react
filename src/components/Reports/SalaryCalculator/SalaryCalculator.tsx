import React from 'react';
import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { PanelLayout } from '../Shared/CalculationReports/PanelLayout/PanelLayout';
import { useIconPanelItems } from '../Shared/CalculationReports/PanelLayout/useIconPanelItems';
import { PanelTypeEnum } from '../Shared/CalculationReports/Shared/sharedTypes';
import { StepsList } from '../Shared/CalculationReports/StepsList/StepsList';
import { CurrentStep } from './CurrentStep';
import { useSalaryCalculator } from './SalaryCalculatorContext/SalaryCalculatorContext';
import { StepNavigation } from './StepNavigation/StepNavigation';
import { SummaryStep } from './Summary/Summary';

const MainContent: React.FC = () => {
  const { editing } = useSalaryCalculator();
  return (
    <Stack gap={4} maxWidth={800}>
      {editing ? <CurrentStep /> : <SummaryStep key="summary" />}
      <StepNavigation />
    </Stack>
  );
};

export const SalaryCalculator: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const {
    steps,
    currentIndex,
    percentComplete,
    isDrawerOpen,
    toggleDrawer,
    editing,
  } = useSalaryCalculator();

  const iconPanelItems = useIconPanelItems(isDrawerOpen, toggleDrawer);

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Other}
      percentComplete={percentComplete}
      showPercentage={editing}
      steps={steps}
      currentIndex={currentIndex}
      icons={editing ? iconPanelItems : []}
      sidebarContent={<StepsList steps={steps} />}
      sidebarTitle={t('Form Steps')}
      isSidebarOpen={editing && isDrawerOpen}
      sidebarAriaLabel={t('Salary Calculator Sections')}
      mainContent={<MainContent />}
      backHref={`/accountLists/${accountListId}/reports/salaryCalculator`}
    />
  );
};
