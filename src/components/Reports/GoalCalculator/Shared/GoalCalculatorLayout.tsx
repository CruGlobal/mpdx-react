import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconPanelLayout } from 'src/components/Shared/IconPanelLayout/IconPanelLayout';
import { GoalCalculatorStepEnum } from '../GoalCalculatorHelper';
import { useGoalCalculator } from './GoalCalculatorContext';

interface GoalCalculatorLayoutProps {
  sectionListPanel: React.ReactNode;
  mainContent: React.ReactNode;
}

/**
 * This is the layout shared by all goal calculator pages. It renders the icon drawer for changing,
 * steps, it has a slot for the section list (which is the categories list on most pages), and it
 * has a slot for the main content.
 */
export const GoalCalculatorLayout: React.FC<GoalCalculatorLayoutProps> = ({
  sectionListPanel,
  mainContent,
}) => {
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
    percentComplete,
  } = useGoalCalculator();

  const handleStepIconClick = (step: GoalCalculatorStepEnum) => {
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
    <IconPanelLayout
      percentComplete={percentComplete}
      iconPanelItems={iconPanelItems}
      sidebarContent={sectionListPanel}
      sidebarTitle={currentStep.title}
      isSidebarOpen={isDrawerOpen}
      sidebarAriaLabel={t('{{step}} Sections', { step: currentStep.title })}
      mainContent={mainContent}
      backHref={`/accountLists/${accountListId}/reports/goalCalculator`}
    />
  );
};
