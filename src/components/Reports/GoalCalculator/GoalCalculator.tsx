import React from 'react';
import CircleIcon from '@mui/icons-material/Circle';
import InfoIcon from '@mui/icons-material/Info';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import {
  HeaderTypeEnum,
  MultiPageHeader,
  multiPageHeaderHeight,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import theme from 'src/theme';
import { GoalCalculatorStepEnum } from './GoalCalculatorHelper';
import { useGoalCalculator } from './Shared/GoalCalculatorContext';
import { ContinueButton } from './SharedComponents/ContinueButton';

const StepTitle = styled(Typography)(({ theme }) => ({
  marginBottom: 0,
  marginTop: theme.spacing(1),
  paddingLeft: theme.spacing(2),
}));

const CategoryListItem = styled(ListItem)(({ theme }) => ({
  padding: 0,
  paddingLeft: theme.spacing(3),
}));

const CategoryListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 'auto',
  marginRight: theme.spacing(0.5),
}));

const CategoriesStack = styled(Stack)(({ theme }) => ({
  paddingBlock: theme.spacing(4),
  height: `calc(100vh - ${navBarHeight} - ${multiPageHeaderHeight})`,
  overflow: 'scroll',
}));

const CategoryContainer = styled('div')(({ theme }) => ({
  paddingInline: theme.spacing(4),
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

interface GoalCalculatorProps {
  isNavListOpen: boolean;
  onNavListToggle: () => void;
}

export const GoalCalculator: React.FC<GoalCalculatorProps> = ({
  isNavListOpen,
  onNavListToggle,
}) => {
  const {
    steps,
    currentStep,
    isDrawerOpen,
    selectedStepId,
    setRightPanelContent,
    toggleDrawer,
    setDrawerOpen,
    handleStepChange,
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

  const { title: stepTitle, categories } = currentStep || {};

  return (
    <>
      <MultiPageHeader
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        title={t('Goal Calculator')}
        headerType={HeaderTypeEnum.Report}
      />
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
            {stepTitle || t('Goal Calculator')}
          </StepTitle>

          <List disablePadding>
            {categories?.map((category) => {
              const { id, title } = category;
              // TODO: Determine whether each category is complete
              const complete = false;
              return (
                <CategoryListItem key={id}>
                  <CategoryListItemIcon>
                    <Box
                      sx={(theme) => ({
                        fontSize: '1rem',
                        color: complete
                          ? theme.palette.mpdxBlue.main
                          : theme.palette.cruGrayDark.main,
                      })}
                    >
                      {complete ? (
                        <CircleIcon sx={{ fontSize: '1rem' }} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ fontSize: '1rem' }} />
                      )}
                    </Box>
                  </CategoryListItemIcon>
                  <ListItemText
                    primary={title}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </CategoryListItem>
              );
            })}
          </List>
        </StyledDrawer>
        {isDrawerOpen && <Divider orientation="vertical" flexItem />}
        <Divider orientation="vertical" flexItem />
        <CategoriesStack flex={1} spacing={4} divider={<Divider />}>
          {categories?.map((category) => {
            const rightPanelContent = category.rightPanelComponent;
            return (
              <CategoryContainer key={category.id}>
                <Typography variant="h6">
                  {category.title}
                  {rightPanelContent && (
                    <IconButton
                      onClick={() => {
                        setRightPanelContent(rightPanelContent);
                      }}
                      aria-label={t('Show additional info')}
                    >
                      <InfoIcon />
                    </IconButton>
                  )}
                </Typography>
                {category.component}
              </CategoryContainer>
            );
          }) ?? (
            <StyledDefaultContent>
              <Typography variant="body1">
                {t(
                  'Please select a step from the left panel to view its content.',
                )}
              </Typography>
            </StyledDefaultContent>
          )}
          <CategoryContainer>
            <ContinueButton onClick={() => {}} />
          </CategoryContainer>
        </CategoriesStack>
      </Stack>
    </>
  );
};
