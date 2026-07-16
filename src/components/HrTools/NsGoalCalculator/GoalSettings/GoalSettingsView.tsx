import React, { useEffect, useRef, useState } from 'react';
import MenuSharp from '@mui/icons-material/MenuSharp';
import { Box, IconButton, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import { GoalSettingsForm, GoalSettingsFormProps } from './GoalSettingsForm';
import { GoalSettingsPresentContent } from './GoalSettingsPresentContent';
import { GoalSettingsReviewContent } from './GoalSettingsReviewContent';
import { GoalSettingsScrollContainer } from './GoalSettingsScrollContainer';
import { GoalSettingsSidebar } from './GoalSettingsSidebar';
import {
  GoalSettingsViewEnum,
  useGoalSettingsView,
} from './useGoalSettingsView';

const Layout = styled(Box)({
  display: 'flex',
  '@media print': {
    '.goal-settings-sidebar': {
      display: 'none',
    },
  },
});

const SidebarColumn = styled('div')(({ theme }) => ({
  flexShrink: 0,
  borderRight: `1px solid ${theme.palette.divider}`,
  '@media screen': {
    height: `calc(100vh - ${navBarHeight})`,
  },
}));

const Sidebar = styled(SidebarColumn, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ theme, open }) => ({
  width: open ? 290 : 0,
  borderRight: open ? undefined : 'none',
  // Clip the fixed-width content while the width animates closed.
  overflowX: 'hidden',
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  '@media screen': {
    overflowY: 'auto',
  },
}));

// The view is a sidebar wrapper around the Goal Settings form and its
// staff-document panes, so it takes the same goal source (an account-list goal
// or a scenario goal) and passes it straight through to each pane.
export const GoalSettingsView: React.FC<GoalSettingsFormProps> = (props) => {
  const { t } = useTranslation();
  const { view } = useGoalSettingsView();
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const collapseButtonRef = useRef<HTMLButtonElement>(null);
  const prevCollapsedRef = useRef(isNavCollapsed);
  const isScenario = 'scenarioGoalId' in props;

  // Keep the collapsed nav out of the tab order and the accessibility tree.
  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.inert = isNavCollapsed;
    }
    if (prevCollapsedRef.current === isNavCollapsed) {
      return;
    }
    prevCollapsedRef.current = isNavCollapsed;
    if (isNavCollapsed) {
      expandButtonRef.current?.focus();
    } else {
      collapseButtonRef.current?.focus();
    }
  }, [isNavCollapsed]);

  // Scenario goals have no "Presenting Your Goal" view. Fall back to Goal
  // Settings so a stale or hand-typed `?view=present-your-goal` URL can't reach
  // it.
  const effectiveView =
    isScenario && view === GoalSettingsViewEnum.PresentYourGoal
      ? GoalSettingsViewEnum.GoalSettings
      : view;

  const renderMainContent = (): React.ReactNode => {
    switch (effectiveView) {
      case GoalSettingsViewEnum.ReviewYourGoal:
        return (
          <GoalSettingsScrollContainer>
            <GoalSettingsReviewContent {...props} />
          </GoalSettingsScrollContainer>
        );
      case GoalSettingsViewEnum.PresentYourGoal:
        return (
          <GoalSettingsScrollContainer>
            <GoalSettingsPresentContent {...props} />
          </GoalSettingsScrollContainer>
        );
      default:
        // GoalSettingsForm uses GoalSettingsScrollContainer internally
        return <GoalSettingsForm {...props} />;
    }
  };

  return (
    <Layout>
      {isNavCollapsed && (
        <SidebarColumn className="goal-settings-sidebar">
          <IconButton
            ref={expandButtonRef}
            aria-label={t('Show navigation')}
            onClick={() => setIsNavCollapsed(false)}
          >
            <MenuSharp />
          </IconButton>
        </SidebarColumn>
      )}
      <Sidebar
        ref={sidebarRef}
        className="goal-settings-sidebar"
        open={!isNavCollapsed}
      >
        <GoalSettingsSidebar
          isScenario={isScenario}
          onCollapse={() => setIsNavCollapsed(true)}
          collapseButtonRef={collapseButtonRef}
        />
      </Sidebar>
      {renderMainContent()}
    </Layout>
  );
};
