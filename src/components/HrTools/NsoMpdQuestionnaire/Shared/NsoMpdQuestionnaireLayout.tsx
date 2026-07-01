import React from 'react';
import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AutosaveForm } from 'src/components/Shared/Autosave/AutosaveForm';
import { useAccountListId } from 'src/hooks/useAccountListId';
import {
  IconPanelItem,
  PanelLayout,
} from '../../Shared/CalculationReports/PanelLayout/PanelLayout';
import { useIconPanelItems } from '../../Shared/CalculationReports/PanelLayout/useIconPanelItems';
import { PanelTypeEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { BackButton } from './BackButton';
import { ContinueButton } from './ContinueButton';
import { useNsoMpdQuestionnaire } from './NsoMpdQuestionnaireContext';

interface NsoMpdQuestionnaireLayoutProps {
  sectionListPanel: React.ReactNode;
  mainContent: React.ReactNode;
}

/**
 * Layout shared by all NSO MPD Questionnaire pages.
 * The icon rail holds a completion progress ring, the menu toggle, and one icon per view step.
 * The sidebar shows the current page's sub-step list, and the main content slot has Back and Continue buttons
 * below it on every step except the last step which supplies its own Back and Submit buttons.
 */
export const NsoMpdQuestionnaireLayout: React.FC<
  NsoMpdQuestionnaireLayoutProps
> = ({ sectionListPanel, mainContent }) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const {
    steps,
    currentStep,
    currentIndex,
    isLastStep,
    percentComplete,
    isDrawerOpen,
    handleContinue,
    handleBack,
    toggleDrawer,
    loading,
  } = useNsoMpdQuestionnaire();

  const isFirstStep = currentIndex === 0;

  const menuToggleItems = useIconPanelItems(isDrawerOpen, toggleDrawer);

  const stepIcons: IconPanelItem[] = steps.map((step) => {
    const isActive = currentStep.step === step.step;
    return {
      key: step.step,
      icon: step.icon,
      label: step.title,
      isActive,
      // The current step's icon stays interactive and toggles the sidebar while the other steps are
      // disabled so users move through the questionnaire with the Continue and Back buttons.
      disabled: !isActive,
      onClick: isActive ? toggleDrawer : undefined,
    };
  });

  const iconPanelItems: IconPanelItem[] = [...menuToggleItems, ...stepIcons];

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Other}
      percentComplete={percentComplete}
      progressLoading={loading}
      icons={iconPanelItems}
      currentIndex={currentIndex}
      backHref={`/accountLists/${accountListId}`}
      sidebarTitle={currentStep.title}
      sidebarContent={sectionListPanel}
      isSidebarOpen={isDrawerOpen}
      sidebarAriaLabel={t('Steps')}
      mainContent={
        <AutosaveForm>
          <Stack spacing={4}>
            {mainContent}
            {!isLastStep && (
              <Stack direction="row" spacing={2} mx={4}>
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
