import React from 'react';
import { Stack } from '@mui/material';
import { AutosaveForm } from 'src/components/Shared/Autosave/AutosaveForm';
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
 * and one icon per view step; the content has Back and Continue buttons below it on every step
 * except the last, which supplies its own Back and Submit buttons. Each step has a single section,
 * so there is no sub-step sidebar.
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
    handleContinue,
    handleBack,
    loading,
  } = useNsoMpdQuestionnaire();

  const isFirstStep = currentIndex === 0;

  const stepIcons: IconPanelItem[] = steps.map((step) => {
    const isActive = currentStep.step === step.step;
    return {
      key: step.step,
      icon: step.icon,
      label: step.title,
      isActive,
      // Only the current step's icon is highlighted; the other steps are disabled so users move
      // through the questionnaire with the Continue and Back buttons.
      disabled: !isActive,
    };
  });

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
        <AutosaveForm>
          <Stack spacing={4}>
            {children}
            {!isLastStep && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mx={4}>
                {!isFirstStep && <BackButton onClick={handleBack} />}
                <ContinueButton onClick={handleContinue} />
              </Stack>
            )}
          </Stack>
        </AutosaveForm>
      }
    />
  );
};
