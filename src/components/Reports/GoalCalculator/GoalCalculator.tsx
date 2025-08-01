import { useRouter } from 'next/router';
import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircleIcon from '@mui/icons-material/Circle';
import InfoIcon from '@mui/icons-material/Info';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { multiPageHeaderHeight } from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import theme from 'src/theme';
import { GoalCalculatorStepEnum } from './GoalCalculatorHelper';
import { useGoalCalculator } from './Shared/GoalCalculatorContext';

const StyledCategoryTitle = styled(Typography)(({ theme }) => ({
  marginBottom: 0,
  marginTop: theme.spacing(1),
  paddingLeft: theme.spacing(2),
  whiteSpace: 'nowrap',
}));

const StyledTitle = styled(Typography)({
  flex: '1 1 100%',
});

const StyledStepListItemButton = styled(ListItemButton)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
}));

const StyledStepListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 'auto',
  marginRight: theme.spacing(0.5),
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
}));

const StyledDefaultContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StyledDrawer = styled(Box, {
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

const StyledCategoryIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected: boolean }>(({ theme, selected }) => ({
  color: selected
    ? theme.palette.mpdxBlue.main
    : theme.palette.cruGrayDark.main,
}));

const StyledStepIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected: boolean }>(({ theme, selected }) => ({
  fontSize: '1rem',
  color: selected
    ? theme.palette.mpdxBlue.main
    : theme.palette.cruGrayDark.main,
}));

export const GoalCalculator: React.FC = () => {
  const router = useRouter();
  const {
    steps,
    currentStep,
    isRightOpen,
    isDrawerOpen,
    selectedStepId,
    selectedCategoryId,
    currentCategory,
    toggleRightPanel,
    toggleDrawer,
    setDrawerOpen,
    handleStepChange,
    handleCategoryChange,
  } = useGoalCalculator();
  const { t } = useTranslation();
  const iconPanelWidth = theme.spacing(5);

  const handleStepIconClick = (stepId: GoalCalculatorStepEnum) => {
    if (selectedStepId === stepId) {
      toggleDrawer();
    } else {
      handleStepChange(stepId);
      setDrawerOpen(true);
    }
  };

  const handleBackClick = () => {
    // Navigate back to the GoalsList page
    const { accountListId } = router.query;
    router.push(`/accountLists/${accountListId}/reports/goalCalculator`);
  };

  const { title: stepTitle, categories: stepCategories } = currentStep || {};
  const {
    title: categoryTitle,
    component: stepComponent,
    rightPanelComponent,
  } = currentCategory || {};

  return (
    <Stack direction="row" flex={1}>
      <Stack sx={{ width: iconPanelWidth }} direction="column">
        {steps?.map((step) => (
          <StyledCategoryIconButton
            key={step.id}
            selected={selectedStepId === step.id}
            onClick={() => handleStepIconClick(step.id)}
          >
            {step.icon}
          </StyledCategoryIconButton>
        ))}
        <StyledCategoryIconButton
          selected={false}
          onClick={handleBackClick}
          aria-label={t('Go Back')}
        >
          <ArrowBackIcon />
        </StyledCategoryIconButton>
      </Stack>
      <Divider orientation="vertical" flexItem />
      <StyledDrawer
        open={isDrawerOpen}
        headerHeight={multiPageHeaderHeight}
        iconPanelWidth={iconPanelWidth}
      >
        <StyledCategoryTitle variant="h6">
          {categoryTitle || t('Goal Calculator')}
        </StyledCategoryTitle>

        <List disablePadding>
          {stepCategories?.map((category) => {
            const { id, title } = category;
            const selected = selectedCategoryId === id;
            return (
              <StyledStepListItemButton
                key={id}
                onClick={() => handleCategoryChange(id)}
              >
                <StyledStepListItemIcon>
                  <StyledStepIcon selected={selected}>
                    {selected ? (
                      <CircleIcon sx={{ fontSize: '1rem' }} />
                    ) : (
                      <RadioButtonUncheckedIcon sx={{ fontSize: '1rem' }} />
                    )}
                  </StyledStepIcon>
                </StyledStepListItemIcon>
                <ListItemText
                  primary={title}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </StyledStepListItemButton>
            );
          })}
        </List>
      </StyledDrawer>
      {isDrawerOpen && <Divider orientation="vertical" flexItem />}
      <Box flex={1}>
        <StyledToolbar disableGutters>
          <StyledTitle variant="h6">
            {stepTitle || t('Goal Calculator')}
          </StyledTitle>
          {!!rightPanelComponent && (
            <IconButton
              onClick={toggleRightPanel}
              aria-label={
                isRightOpen ? t('Hide Right Panel') : t('Show Right Panel')
              }
            >
              <InfoIcon />
            </IconButton>
          )}
        </StyledToolbar>
        <Box>
          {stepComponent || (
            <StyledDefaultContent>
              <Typography variant="body1">
                {t(
                  'Please select a step from the left panel to view its content.',
                )}
              </Typography>
            </StyledDefaultContent>
          )}
        </Box>
      </Box>
    </Stack>
  );
};
