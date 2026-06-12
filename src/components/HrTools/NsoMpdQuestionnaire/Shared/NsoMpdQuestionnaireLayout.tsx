import React from 'react';
import { Box, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import {
  IconPanelItem,
  PanelLayout,
} from '../../Shared/CalculationReports/PanelLayout/PanelLayout';
import { useIconPanelItems } from '../../Shared/CalculationReports/PanelLayout/useIconPanelItems';
import { PanelTypeEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { NsoMpdQuestionnaireStepEnum } from '../NsoMpdQuestionnaireHelper';
import { ContinueButton } from './ContinueButton';
import { useNsoMpdQuestionnaire } from './NsoMpdQuestionnaireContext';

interface NsoMpdQuestionnaireLayoutProps {
  sectionListPanel: React.ReactNode;
  mainContent: React.ReactNode;
}

/**
 * This is the layout shared by all NSO MPD Questionnaire pages. The icon rail holds the menu
 * toggle, one icon per view step (used to switch views), and a back arrow to the dashboard. The
 * collapsible sidebar shows the current page's own sub-step list, and the main content slot has a
 * Continue button below it on every step except the last.
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
    isDrawerOpen,
    handleStepChange,
    handleContinue,
    toggleDrawer,
    setDrawerOpen,
  } = useNsoMpdQuestionnaire();

  const handleStepIconClick = (step: NsoMpdQuestionnaireStepEnum) => {
    if (currentStep.step === step) {
      toggleDrawer();
    } else {
      handleStepChange(step);
      setDrawerOpen(true);
    }
  };

  const menuToggleItems = useIconPanelItems(isDrawerOpen, toggleDrawer);

  const stepIcons: IconPanelItem[] = steps.map((step) => ({
    key: step.step,
    icon: step.icon,
    label: step.title,
    isActive: currentStep.step === step.step,
    onClick: () => handleStepIconClick(step.step),
  }));

  const iconPanelItems: IconPanelItem[] = [...menuToggleItems, ...stepIcons];

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Other}
      percentComplete={null}
      icons={iconPanelItems}
      currentIndex={currentIndex}
      backHref={`/accountLists/${accountListId}`}
      sidebarTitle={currentStep.title}
      sidebarContent={sectionListPanel}
      isSidebarOpen={isDrawerOpen}
      sidebarAriaLabel={t('Steps')}
      mainContent={
        <Stack spacing={4}>
          {mainContent}
          {!isLastStep && (
            <Box mx={4}>
              <ContinueButton onClick={handleContinue} />
            </Box>
          )}
        </Stack>
      }
    />
  );
};
