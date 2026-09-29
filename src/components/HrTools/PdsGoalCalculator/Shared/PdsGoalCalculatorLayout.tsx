import React, { useMemo } from 'react';
import { Alert } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useAutosaveForm } from 'src/components/Shared/Autosave/AutosaveForm';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { PanelLayout } from '../../Shared/CalculationReports/PanelLayout/PanelLayout';
import { PanelTypeEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { PdsGoalCalculatorStepEnum } from '../PdsGoalCalculatorHelper';
import { usePdsGoalCalculator } from './PdsGoalCalculatorContext';
import { isSetupComplete } from './pdsCompletion';

interface PdsGoalCalculatorLayoutProps {
  sectionListPanel: React.ReactNode;
  mainContent: React.ReactNode;
}

export const PdsGoalCalculatorLayout: React.FC<
  PdsGoalCalculatorLayoutProps
> = ({ sectionListPanel, mainContent }) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const {
    steps,
    currentStep,
    calculation,
    handleStepChange,
    isDrawerOpen,
    setDrawerOpen,
    toggleDrawer,
    percentComplete,
    calculationLoading,
    constantsUnavailable,
  } = usePdsGoalCalculator();

  const currentYear = useMemo(() => DateTime.local().year, []);
  const calculationsYear = calculation?.calculationsYear;
  const isPastYear = !!calculationsYear && calculationsYear !== currentYear;

  const setupComplete = isSetupComplete(calculation);
  const { allValid } = useAutosaveForm();
  const isSetupValid = setupComplete && allValid;

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
    disabled: !isSetupValid && step.step !== PdsGoalCalculatorStepEnum.Setup,
    onClick: () => handleStepIconClick(step.step),
  }));

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Other}
      percentComplete={percentComplete}
      progressLoading={calculationLoading}
      icons={iconPanelItems}
      sidebarContent={sectionListPanel}
      sidebarTitle={currentStep.title}
      isSidebarOpen={isDrawerOpen}
      sidebarAriaLabel={t('{{step}} Sections', { step: currentStep.title })}
      mainContent={
        <>
          {constantsUnavailable && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {t(
                "This goal's {{year}} rates are not available, so its totals can't be calculated.",
                { year: calculationsYear },
              )}
            </Alert>
          )}
          {isPastYear && !constantsUnavailable && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {t(
                'This goal uses {{year}} rates. To use {{currentYear}} rates, create a new goal.',
                { year: calculationsYear, currentYear },
              )}
            </Alert>
          )}
          {mainContent}
        </>
      }
      backHref={`/accountLists/${accountListId}/hrTools/pdsGoalCalculator`}
      backTitle={t('Go Back')}
    />
  );
};
