import React from 'react';
import { Box, styled } from '@mui/material';
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

const Sidebar = styled('div')(({ theme }) => ({
  flexShrink: 0,
  width: 290,
  borderRight: `1px solid ${theme.palette.divider}`,
  '@media screen': {
    height: `calc(100vh - ${navBarHeight})`,
    overflow: 'auto',
  },
}));

// The view is a sidebar wrapper around the Goal Settings form and its
// staff-document panes, so it takes the same goal source (an account-list goal
// or a scenario goal) and passes it straight through to each pane.
export const GoalSettingsView: React.FC<GoalSettingsFormProps> = (props) => {
  const { view } = useGoalSettingsView();
  const isScenario = 'scenarioGoalId' in props;

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
      <Sidebar className="goal-settings-sidebar">
        <GoalSettingsSidebar isScenario={isScenario} />
      </Sidebar>
      {renderMainContent()}
    </Layout>
  );
};
