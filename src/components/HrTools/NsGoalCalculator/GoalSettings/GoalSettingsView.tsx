import React, { useEffect, useRef } from 'react';
import MenuSharp from '@mui/icons-material/MenuSharp';
import { Box, IconButton, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import { useDrawerOpenState } from '../../Shared/CalculationReports/PanelLayout/useDrawerOpenState';
import { GoalSettingsForm, GoalSettingsFormProps } from './GoalSettingsForm';
import { GoalSettingsNavigationProvider } from './GoalSettingsNavigationContext';
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

export type GoalSettingsViewProps = GoalSettingsFormProps & {
  /** Where Back to Table, Cancel, and a successful save return to. */
  returnUrl?: string;
  /** Defaults to "Back to Table". */
  returnLabel?: string;
};

// The view is a sidebar wrapper around the Goal Settings form and its
// staff-document panes, so it takes the same goal source (an account-list goal
// or a scenario goal) and passes it straight through to each pane.
export const GoalSettingsView: React.FC<GoalSettingsViewProps> = (props) => {
  const { t } = useTranslation();
  const { view } = useGoalSettingsView();
  const [isNavOpen, setIsNavOpen] = useDrawerOpenState();
  const isNavCollapsed = !isNavOpen;
  const sidebarRef = useRef<HTMLDivElement>(null);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const collapseButtonRef = useRef<HTMLButtonElement>(null);
  // Only move focus when the user toggles the nav, not when it closes itself
  // on phones after mounting.
  const moveFocusRef = useRef(false);
  const toggleNav = (open: boolean) => {
    moveFocusRef.current = true;
    setIsNavOpen(open);
  };
  const isScenario = 'scenarioGoalId' in props;
  const goalSource: GoalSettingsFormProps = isScenario
    ? { scenarioGoalId: props.scenarioGoalId }
    : { accountListId: props.accountListId };

  // Keep the collapsed nav out of the tab order and the accessibility tree.
  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.inert = isNavCollapsed;
    }
    if (!moveFocusRef.current) {
      return;
    }
    moveFocusRef.current = false;
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
            <GoalSettingsReviewContent {...goalSource} />
          </GoalSettingsScrollContainer>
        );
      case GoalSettingsViewEnum.PresentYourGoal:
        return (
          <GoalSettingsScrollContainer>
            <GoalSettingsPresentContent {...goalSource} />
          </GoalSettingsScrollContainer>
        );
      default:
        // GoalSettingsForm uses GoalSettingsScrollContainer internally
        return <GoalSettingsForm {...goalSource} />;
    }
  };

  return (
    <GoalSettingsNavigationProvider
      returnUrl={props.returnUrl}
      returnLabel={props.returnLabel}
    >
      <Layout>
        {isNavCollapsed && (
          <SidebarColumn className="goal-settings-sidebar">
            <IconButton
              ref={expandButtonRef}
              aria-label={t('Show navigation')}
              onClick={() => toggleNav(true)}
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
            onCollapse={() => toggleNav(false)}
            collapseButtonRef={collapseButtonRef}
          />
        </Sidebar>
        {renderMainContent()}
      </Layout>
    </GoalSettingsNavigationProvider>
  );
};
