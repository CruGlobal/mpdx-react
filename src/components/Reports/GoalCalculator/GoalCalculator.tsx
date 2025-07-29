import React from 'react';
import CircleIcon from '@mui/icons-material/Circle';
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

const StyledCategoryIconButton = styled(IconButton)<{ selected: boolean }>(
  ({ theme, selected }) => ({
    color: selected
      ? theme.palette.mpdxBlue.main
      : theme.palette.cruGrayDark.main,
  }),
);

const StyledCategoryTitle = styled(Typography)(({ theme }) => ({
  marginBottom: 0,
  marginTop: theme.spacing(1),
  paddingLeft: theme.spacing(2),
}));

const StyledStepListItemButton = styled(ListItemButton)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
}));

const StyledStepListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 'auto',
  marginRight: theme.spacing(0.5),
}));

const StyledStepIcon = styled('div')<{ selected: boolean }>(
  ({ theme, selected }) => ({
    fontSize: '1rem',
    color: selected
      ? theme.palette.mpdxBlue.main
      : theme.palette.cruGrayDark.main,
  }),
);

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
}));

const StyledTitle = styled(Typography)({
  flex: '1 1 100%',
});

const StyledDefaultContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
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
    selectedCategoryID,
    selectedStepID,
    currentStep,
    handleCategoryChange,
    handleStepChange,
  } = useGoalCalculator();
  const { t } = useTranslation();

  const { title: categoryTitle, steps: categorySteps } = currentCategory || {};
  const { title: stepTitle, component: stepComponent } = currentStep || {};

  return (
    <>
      <MultiPageHeader
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
              onClick={() => handleCategoryChange(category.id)}
              selected={selectedCategoryID === category.id}
            >
              {category.icon}
            </StyledCategoryIconButton>
          ))}
        </Stack>
        <Divider orientation="vertical" flexItem />
        <Box width={240}>
          <StyledCategoryTitle variant="h6">
            {categoryTitle || t('Goal Calculator')}
          </StyledCategoryTitle>

          <List disablePadding>
            {categorySteps?.map((step) => {
              const { id, title } = step;
              return (
                <StyledStepListItemButton
                  key={id}
                  onClick={() => handleStepChange(id)}
                >
                  <StyledStepListItemIcon>
                    <StyledStepIcon selected={selectedStepID === id}>
                      {selectedStepID === id ? (
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
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box flex={1}>
          <StyledToolbar disableGutters>
            <StyledTitle variant="h6">
              {stepTitle || t('Goal Calculator')}
            </StyledTitle>
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
