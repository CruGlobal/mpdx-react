import React from 'react';
import { Divider, IconButton, Stack, Typography, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import { multiPageHeaderHeight } from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import theme from 'src/theme';
import { GoalCalculatorStepEnum } from '../GoalCalculatorHelper';
import { useGoalCalculator } from './GoalCalculatorContext';

const MainContent = styled('div')(({ theme }) => ({
  paddingBlock: theme.spacing(4),
  width: '100%',
  height: `calc(100vh - ${navBarHeight} - ${multiPageHeaderHeight})`,
  overflow: 'scroll',
}));

const StepTitle = styled(Typography)(({ theme }) => ({
  marginBottom: 0,
  marginTop: theme.spacing(1),
  paddingLeft: theme.spacing(2),
}));

const StyledDrawer = styled('div', {
  shouldForwardProp: (prop) =>
    prop !== 'open' && prop !== 'headerHeight' && prop !== 'iconPanelWidth',
})<{
  open: boolean;
  headerHeight: string;
  iconPanelWidth: string;
}>(({ theme, open, headerHeight, iconPanelWidth }) => ({
  width: open ? 240 : 0,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflow: 'hidden',
  borderRight: open ? `1px solid ${theme.palette.cruGrayLight.main}` : 'none',
  [theme.breakpoints.down('sm')]: {
    position: 'absolute',
    top: headerHeight,
    left: `calc(${iconPanelWidth} + 1px)`,
    height: '100%',
    backgroundColor: theme.palette.common.white,
    zIndex: 270,
  },
}));

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
  const iconPanelWidth = theme.spacing(5);
  const {
    steps,
    currentStep,
    handleStepChange,
    isDrawerOpen,
    setDrawerOpen,
    toggleDrawer,
    selectedStepId,
  } = useGoalCalculator();

  const handleStepIconClick = (stepId: GoalCalculatorStepEnum) => {
    if (selectedStepId === stepId) {
      toggleDrawer();
    } else {
      handleStepChange(stepId);
      setDrawerOpen(true);
    }
  };

  return (
    <Stack direction="row">
      <Stack direction="column" width={iconPanelWidth}>
        {steps.map((step) => (
          <IconButton
            key={step.id}
            sx={(theme) => ({
              color:
                selectedStepId === step.id
                  ? theme.palette.mpdxBlue.main
                  : theme.palette.cruGrayDark.main,
            })}
            onClick={() => handleStepIconClick(step.id)}
          >
            {step.icon}
          </IconButton>
        ))}
      </Stack>
      <Divider orientation="vertical" flexItem />
      <StyledDrawer
        open={isDrawerOpen}
        headerHeight={multiPageHeaderHeight}
        iconPanelWidth={iconPanelWidth}
      >
        <StepTitle variant="h6">
          {currentStep?.title || t('Goal Calculator')}
        </StepTitle>

        {sectionListPanel}
      </StyledDrawer>
      {isDrawerOpen && <Divider orientation="vertical" flexItem />}
      <Divider orientation="vertical" flexItem />
      <MainContent>{mainContent}</MainContent>
    </Stack>
  );
};
