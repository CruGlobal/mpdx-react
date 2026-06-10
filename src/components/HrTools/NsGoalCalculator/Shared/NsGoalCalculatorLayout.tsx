import React from 'react';
import { useTranslation } from 'react-i18next';
import { PanelLayout } from '../../Shared/CalculationReports/PanelLayout/PanelLayout';
import { useIconPanelItems } from '../../Shared/CalculationReports/PanelLayout/useIconPanelItems';
import { PanelTypeEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { useNsGoalCalculator } from './NsGoalCalculatorContext';
import { NsGoalCalculatorStepsList } from './NsGoalCalculatorStepsList';

interface NsGoalCalculatorLayoutProps {
  mainContent: React.ReactNode;
}

/**
 * This is the layout shared by all new staff goal calculator pages. It renders the collapsible
 * step list sidebar and a slot for the main content.
 */
export const NsGoalCalculatorLayout: React.FC<NsGoalCalculatorLayoutProps> = ({
  mainContent,
}) => {
  const { t } = useTranslation();
  const { currentIndex, isDrawerOpen, toggleDrawer } = useNsGoalCalculator();

  const iconPanelItems = useIconPanelItems(isDrawerOpen, toggleDrawer);

  return (
    <PanelLayout
      panelType={PanelTypeEnum.Other}
      percentComplete={null}
      icons={iconPanelItems}
      currentIndex={currentIndex}
      sidebarTitle={t('Your MPD Goal')}
      sidebarContent={<NsGoalCalculatorStepsList />}
      isSidebarOpen={isDrawerOpen}
      sidebarAriaLabel={t('Steps')}
      mainContent={mainContent}
    />
  );
};
