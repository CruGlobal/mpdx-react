import React from 'react';
import CircleIcon from '@mui/icons-material/Circle';
import InfoIcon from '@mui/icons-material/Info';
import MenuIcon from '@mui/icons-material/Menu';
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
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
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

const StyledDrawer = styled(Box)<{ open: boolean }>(({ theme, open }) => ({
  width: open ? 240 : 0,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflow: 'hidden',
  borderRight: open ? `1px solid ${theme.palette.cruGrayLight.main}` : 'none',
}));

const StyledCategoryIconButton = styled(IconButton)<{ selected: boolean }>(
  ({ theme, selected }) => ({
    color: selected
      ? theme.palette.mpdxBlue.main
      : theme.palette.cruGrayDark.main,
  }),
);

const StyledStepIcon = styled(Box)<{ selected: boolean }>(
  ({ theme, selected }) => ({
    fontSize: '1rem',
    color: selected
      ? theme.palette.mpdxBlue.main
      : theme.palette.cruGrayDark.main,
  }),
);

const StyledMenuButton = styled(IconButton)(({ theme }) => ({
  marginRight: theme.spacing(1),
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
    categories,
    currentCategory,
    selectedCategoryId,
    selectedStepId,
    currentStep,
    isRightOpen,
    isDrawerOpen,
    headerRef,
    handleCategoryChange,
    handleStepChange,
    toggleRightPanel,
    toggleDrawer,
    setDrawerOpen,
  } = useGoalCalculator();
  const { t } = useTranslation();

  const handleCategoryIconClick = (categoryId: typeof selectedCategoryId) => {
    if (selectedCategoryId === categoryId) {
      toggleDrawer();
    } else {
      handleCategoryChange(categoryId);
      setDrawerOpen(true);
    }
  };

  const { title: categoryTitle, steps: categorySteps } = currentCategory || {};
  const {
    title: stepTitle,
    component: stepComponent,
    rightPanelComponent,
  } = currentStep || {};

  return (
    <>
      <MultiPageHeader
        ref={headerRef}
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        title={t('Goal Calculator')}
        headerType={HeaderTypeEnum.Report}
      />
      <Stack direction="row" flex={1}>
        <Stack direction="column">
          {categories.map((category) => (
            <StyledCategoryIconButton
              key={category.id}
              selected={selectedCategoryId === category.id}
              onClick={() => handleCategoryIconClick(category.id)}
            >
              {category.icon}
            </StyledCategoryIconButton>
          ))}
        </Stack>
        <Divider orientation="vertical" flexItem />
        <StyledDrawer open={isDrawerOpen}>
          <StyledCategoryTitle variant="h6">
            {categoryTitle || t('Goal Calculator')}
          </StyledCategoryTitle>

          <List disablePadding>
            {categorySteps?.map((step) => {
              const { id, title } = step;
              const selected = selectedStepId === id;
              return (
                <StyledStepListItemButton
                  key={id}
                  onClick={() => handleStepChange(id)}
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
            <StyledMenuButton
              onClick={toggleDrawer}
              aria-label={isDrawerOpen ? t('Hide Steps') : t('Show Steps')}
            >
              <MenuIcon />
            </StyledMenuButton>
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
    </>
  );
};
