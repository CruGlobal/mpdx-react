import React from 'react';
import { Box, Typography } from '@mui/material';
import theme from 'src/theme';
import {
  SalaryCalculatorProvider,
  useSalaryCalculator,
} from './SalaryCalculatorContext';
import { SalaryCalculatorLayout } from './SalaryCalculatorLayout';
import { SectionList } from './SectionList/SectionList';
import { StepNavigation } from './StepNavigation/StepNavigation';

const MainContent: React.FC = () => {
  const { sectionSteps, selectedSection, setSelectedSection } =
    useSalaryCalculator();
  const currentStepIndex = sectionSteps.findIndex(
    (step) => step.key === selectedSection,
  );
  const currentStep = sectionSteps[currentStepIndex];

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
    // Temporary content for each step
    <Box px={theme.spacing(3)}>
      <Typography variant="h5">
        {currentStep ? currentStep.label : ''}
      </Typography>
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

const SalaryCalculatorContent: React.FC = () => {
  const { selectedSection, stepStatus, isDrawerOpen, toggleDrawer } =
    useSalaryCalculator();
  return (
    <SalaryCalculatorLayout
      sectionListPanel={
        <SectionList
          selectedSection={selectedSection}
          stepStatus={stepStatus}
        />
      }
      mainContent={<MainContent />}
      isDrawerOpen={isDrawerOpen}
      toggleDrawer={toggleDrawer}
    />
  );
};
