import React, { useCallback, useState } from 'react';
import { Box, Typography } from '@mui/material';
import theme from 'src/theme';
import { SalaryCalculatorLayout } from './SalaryCalculatorLayout';
import { SectionList } from './SectionList/SectionList';
import { StepNavigation } from './StepNavigation/StepNavigation';
import {
  SalaryCalculatorSectionEnum,
  useSectionSteps,
} from './useSectionSteps';
import type { StepStatusItem } from './SectionList/SectionList';

interface MainContentProps {
  selectedSection: SalaryCalculatorSectionEnum;
  setSelectedSection: (section: SalaryCalculatorSectionEnum) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  selectedSection,
  setSelectedSection,
}) => {
  const sectionSteps = useSectionSteps();
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

export const SalaryCalculator: React.FC = () => {
  const [selectedSection, setSelectedSection] =
    useState<SalaryCalculatorSectionEnum>(
      SalaryCalculatorSectionEnum.EffectiveDate,
    );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((open) => !open);
  }, []);
  const sectionSteps = useSectionSteps();

  const stepStatus: StepStatusItem[] = sectionSteps.map((step) => ({
    key: step.key,
    currentStep: step.key === selectedSection,
  }));
  return (
    <SalaryCalculatorLayout
      sectionListPanel={
        <SectionList
          selectedSection={selectedSection}
          stepStatus={stepStatus}
        />
      }
      mainContent={
        <MainContent
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
        />
      }
      isDrawerOpen={isDrawerOpen}
      toggleDrawer={toggleDrawer}
    />
  );
};
