import React, { useEffect, useRef } from 'react';
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
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { useGoalCalculator } from './Shared/GoalCalculatorContext';

// Typography Components
const StyledCategoryTitle = styled(Typography)(({ theme }) => ({
  marginBottom: 0,
  marginTop: theme.spacing(1),
  paddingLeft: theme.spacing(2),
}));

const StyledTitle = styled(Typography)({
  flex: '1 1 100%',
});

// List Components
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

interface GoalCalculatorProps {
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  onHeaderHeightChange?: (height: number) => void;
}

export const GoalCalculator: React.FC<GoalCalculatorProps> = ({
  isNavListOpen,
  onNavListToggle,
  onHeaderHeightChange,
}) => {
  const {
    categories,
    currentCategory,
    selectedCategoryId,
    selectedStepId,
    currentStep,
    isRightOpen,
    handleCategoryChange,
    handleStepChange,
    toggleRightPanel,
  } = useGoalCalculator();
  const { t } = useTranslation();
  const headerRef = useRef<HTMLDivElement>(null);

  // Calculate header height on mount and resize
  useEffect(() => {
    const calculateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        onHeaderHeightChange?.(height);
      }
    };

    calculateHeaderHeight();
    window.addEventListener('resize', calculateHeaderHeight);

    return () => {
      window.removeEventListener('resize', calculateHeaderHeight);
    };
  }, [onHeaderHeightChange]);

  const { title: categoryTitle, steps: categorySteps } = currentCategory || {};
  const {
    title: stepTitle,
    component: stepComponent,
    rightPanelComponent,
  } = currentStep || {};

  return (
    <>
      <Box ref={headerRef}>
        <MultiPageHeader
          isNavListOpen={isNavListOpen}
          onNavListToggle={onNavListToggle}
          title={t('Goal Calculator')}
          headerType={HeaderTypeEnum.Report}
        />
      </Box>
      <Stack direction="row" flex={1}>
        <Stack direction="column">
          {categories.map((category) => (
            <IconButton
              key={category.id}
              sx={(theme) => ({
                color:
                  selectedCategoryId === category.id
                    ? theme.palette.mpdxBlue.main
                    : theme.palette.cruGrayDark.main,
              })}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.icon}
            </IconButton>
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
              const selected = selectedStepId === id;
              return (
                <StyledStepListItemButton
                  key={id}
                  onClick={() => handleStepChange(id)}
                >
                  <StyledStepListItemIcon>
                    <Box
                      sx={(theme) => ({
                        fontSize: '1rem',
                        color: selected
                          ? theme.palette.mpdxBlue.main
                          : theme.palette.cruGrayDark.main,
                      })}
                    >
                      {selected ? (
                        <CircleIcon sx={{ fontSize: '1rem' }} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ fontSize: '1rem' }} />
                      )}
                    </Box>
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
