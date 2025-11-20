import { useRouter } from 'next/router';
import React from 'react';
import { MenuOpenSharp, MenuSharp } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { IconPanelLayout } from 'src/components/Shared/IconPanelLayout/IconPanelLayout';
import theme from 'src/theme';
import { CurrentStep } from './CurrentStep';
import {
  SalaryCalculatorProvider,
  useSalaryCalculator,
} from './SalaryCalculatorContext/SalaryCalculatorContext';
import { SectionList } from './SectionList/SectionList';
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
  const router = useRouter();
  const { selectedSection, stepStatus, isDrawerOpen, toggleDrawer } =
    useSalaryCalculator();
  const { accountListId } = router.query;

  const iconPanelItems = [
    {
      icon: isDrawerOpen ? <MenuOpenSharp /> : <MenuSharp />,
      label: t('Toggle Menu'),
      onClick: toggleDrawer,
    },
  ];

  return (
    <IconPanelLayout
      percentComplete={50}
      iconPanelItems={iconPanelItems}
      sidebarContent={
        <SectionList
          selectedSection={selectedSection}
          stepStatus={stepStatus}
        />
      }
      sidebarTitle={t('Form Steps')}
      isSidebarOpen={isDrawerOpen}
      sidebarAriaLabel={t('Salary Calculator Sections')}
      mainContent={<MainContent />}
      backHref={`/accountLists/${accountListId}`}
    />
  );
};
