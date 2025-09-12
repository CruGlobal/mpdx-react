import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from '@mui/material';
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

  const bottomIconPanelItems = [
    {
      key: 'back',
      icon: (
        <Link
          component={NextLink}
          href={`/accountLists/${accountListId}/reports/goalCalculator`}
          sx={{ textDecoration: 'none', color: 'inherit' }}
          aria-label={t('Go back')}
        >
          <ArrowBackIcon />
        </Link>
      ),
      label: t('Go back'),
      onClick: () => {},
    },
  ];

  return (
    <IconPanelLayout
      iconPanelItems={iconPanelItems}
      bottomIconPanelItems={bottomIconPanelItems}
      sidebarContent={sectionListPanel}
      sidebarTitle={currentStep.title}
      isSidebarOpen={isDrawerOpen}
      sidebarAriaLabel={t('{{step}} Sections', { step: currentStep.title })}
      mainContent={mainContent}
    />
  );
};
