import React from 'react';
import { Stack } from '@mui/material';
import { useAccountListId } from 'src/hooks/useAccountListId';
import {
  IconPanelItem,
  PanelLayout,
} from '../../Shared/CalculationReports/PanelLayout/PanelLayout';
import { PanelTypeEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { BackButton } from './BackButton';
import { ContinueButton } from './ContinueButton';
import { useNsoMpdQuestionnaire } from './NsoMpdQuestionnaireContext';

interface NsoMpdQuestionnaireLayoutProps {
  children?: React.ReactNode;
}

/**
 * Layout shared by all NSO MPD Questionnaire pages. The icon rail holds a completion progress ring
 * and one navigable icon per view step, so users can jump directly to any step; the content has Back
 * and Continue buttons below it on every step except the last, which supplies its own Back and Submit
 * buttons. Each step has a single section, so there is no sub-step sidebar.
 */
export const NsoMpdQuestionnaireLayout: React.FC<
  NsoMpdQuestionnaireLayoutProps
> = ({ children }) => {
  const accountListId = useAccountListId();
  const {
    steps,
    currentStep,
    currentIndex,
    isLastStep,
    percentComplete,
    handleStepChange,
    handleContinue,
    handleBack,
    loading,
  } = useNsoMpdQuestionnaire();

  const isFirstStep = currentIndex === 0;

  const stepIcons: IconPanelItem[] = steps.map((step) => ({
    key: step.step,
    icon: step.icon,
    label: step.title,
    isActive: currentStep.step === step.step,
    onClick: () => handleStepChange(step.step),
  }));

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Other}
      percentComplete={percentComplete}
      progressLoading={loading}
      icons={stepIcons}
      currentIndex={currentIndex}
      backHref={`/accountLists/${accountListId}`}
      hideSidebar
      mainContent={
        <Stack spacing={4}>
          {children}
          {!isLastStep && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mx={4}>
              {!isFirstStep && <BackButton onClick={handleBack} />}
              <ContinueButton onClick={handleContinue} />
            </Stack>
          )}
        </Stack>
      }
    />
  );
};
