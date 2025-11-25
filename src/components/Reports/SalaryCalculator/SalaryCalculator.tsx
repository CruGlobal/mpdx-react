import React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
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
  const { sectionSteps, selectedSection, setSelectedSection } =
    useSalaryCalculator();
  const currentStepIndex = sectionSteps.findIndex(
    (step) => step.key === selectedSection,
  );

  const handleCancel = () => {};
  const handleBack = () => {
    if (currentStepIndex > 0) {
      setSelectedSection(sectionSteps[currentStepIndex - 1].key);
    }
  };
  const handleContinue = () => {
    if (currentStepIndex < sectionSteps.length - 1) {
      setSelectedSection(sectionSteps[currentStepIndex + 1].key);
    }
  };

  return (
    <Box px={theme.spacing(3)}>
      <CurrentStep />
      <StepNavigation
        onCancel={handleCancel}
        onBack={handleBack}
        onContinue={handleContinue}
        isBackDisabled={currentStepIndex === 0}
        isContinueDisabled={currentStepIndex === sectionSteps.length - 1}
      />
    </Box>
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

  const { isDrawerOpen, toggleDrawer, steps } = useSalaryCalculator();

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Other}
      percentComplete={50}
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
