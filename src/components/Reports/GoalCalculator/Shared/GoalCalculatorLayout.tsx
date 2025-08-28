import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import { multiPageHeaderHeight } from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import theme from 'src/theme';
import { GoalCalculatorStepEnum } from '../GoalCalculatorHelper';
import { useGoalCalculator } from './GoalCalculatorContext';

const iconPanelWidth = theme.spacing(5);

const PrintableStack = styled(Stack)({
  '@media print': {
    // Hide all children except for the main content
    '> *:not(.main-content)': {
      display: 'none',
    },
  },
});

const MainContent = styled('div')(({ theme }) => ({
  paddingBlock: theme.spacing(4),
  width: '100%',
  '@media screen': {
    height: `calc(100vh - ${navBarHeight} - ${multiPageHeaderHeight})`,
    overflow: 'scroll',
  },
}));

const StepTitle = styled(Typography)(({ theme }) => ({
  marginBottom: 0,
  marginTop: theme.spacing(1),
  paddingLeft: theme.spacing(2),
}));

const StyledDrawer = styled('nav', {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ theme, open }) => ({
  width: open ? 240 : 0,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflow: 'hidden',
  borderRight: open ? `1px solid ${theme.palette.cruGrayLight.main}` : 'none',
  [theme.breakpoints.down('sm')]: {
    position: 'absolute',
    top: multiPageHeaderHeight,
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
  const router = useRouter();
  const { accountListId } = router.query;
  const iconPanelWidth = theme.spacing(5);
  const {
    steps,
    currentStep,
    handleStepChange,
    isDrawerOpen,
    setDrawerOpen,
    toggleDrawer,
  } = useGoalCalculator();

  const handleStepIconClick = (step: GoalCalculatorStepEnum) => {
    if (currentStep.step === step) {
      toggleDrawer();
    } else {
      handleStepChange(step);
      setDrawerOpen(true);
    }
  };

  return (
    <PrintableStack direction="row">
      <Stack direction="column" width={iconPanelWidth}>
        {steps.map((step) => (
          <IconButton
            key={step.step}
            aria-label={step.title}
            sx={(theme) => ({
              color:
                currentStep.step === step.step
                  ? theme.palette.mpdxBlue.main
                  : theme.palette.cruGrayDark.main,
            })}
            onClick={() => handleStepIconClick(step.step)}
          >
            {step.icon}
          </IconButton>
        ))}
        <Link
          component={NextLink}
          href={`/accountLists/${accountListId}/reports/goalCalculator`}
          sx={{ textDecoration: 'none' }}
          aria-label={t('Go back')}
        >
          <IconButton
            sx={(theme) => ({
              color: theme.palette.cruGrayDark.main,
            })}
          >
            <ArrowBackIcon />
          </IconButton>
        </Link>
      </Stack>
      <Divider orientation="vertical" flexItem />
      <StyledDrawer
        open={isDrawerOpen}
        aria-label={t('{{step}} Sections', { step: currentStep.title })}
        aria-expanded={isDrawerOpen}
      >
        <StepTitle variant="h6">{currentStep.title}</StepTitle>
        {sectionListPanel}
      </StyledDrawer>
      {isDrawerOpen && <Divider orientation="vertical" flexItem />}
      <Divider orientation="vertical" flexItem />
      <MainContent className="main-content">{mainContent}</MainContent>
    </PrintableStack>
  );
};
