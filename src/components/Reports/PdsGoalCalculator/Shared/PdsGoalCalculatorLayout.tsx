// src/components/Reports/PdsGoalCalculator/Shared/PdsGoalCalculatorLayout.tsx
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PanelLayout } from '../../Shared/CalculationReports/PanelLayout/PanelLayout';
import { PanelTypeEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { PdsGoalCalculatorStepEnum } from '../PdsGoalCalculatorHelper';
import { usePdsGoalCalculator } from './PdsGoalCalculatorContext';

interface PdsGoalCalculatorLayoutProps {
  sectionListPanel: React.ReactNode;
  mainContent: React.ReactNode;
}

export const PdsGoalCalculatorLayout: React.FC<
  PdsGoalCalculatorLayoutProps
> = ({ sectionListPanel, mainContent }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { accountListId } = router.query;
  const {
    steps,
    currentStep,
    handleStepChange,
    isDrawerOpen,
    setDrawerOpen,
    toggleDrawer,
  } = usePdsGoalCalculator();

  const handleStepIconClick = (step: PdsGoalCalculatorStepEnum) => {
    if (currentStep.step === step) {
      toggleDrawer();
    } else {
      handleStepChange(step);
      setDrawerOpen(true);
    }
  };

  const iconPanelItems = steps.map((step) => ({
    key: step.step,
    icon: step.icon,
    label: step.title,
    isActive: currentStep.step === step.step,
    onClick: () => handleStepIconClick(step.step),
  }));

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Other}
      percentComplete={0}
      icons={iconPanelItems}
      sidebarContent={sectionListPanel}
      sidebarTitle={currentStep.title}
      isSidebarOpen={isDrawerOpen}
      sidebarAriaLabel={t('{{step}} Sections', { step: currentStep.title })}
      mainContent={mainContent}
      backHref={`/accountLists/${accountListId}/reports/pds-goal-calculator`}
      backTitle={t('Go Back')}
    />
  );
};
