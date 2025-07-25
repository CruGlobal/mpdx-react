import React, { useContext } from 'react';
import CircleIcon from '@mui/icons-material/Circle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import {
  Box,
  Container,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import theme from 'src/theme';
import {
  GoalCalculatorContext,
  GoalCalculatorType,
} from './Shared/GoalCalculatorContext';

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
  } = useContext(GoalCalculatorContext) as GoalCalculatorType;

  const { title: categoryTitle, steps: categorySteps } = currentCategory || {};
  const { title: stepTitle, component: stepComponent } = currentStep || {};

  return (
    <Box>
      <MultiPageHeader
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        title={'Goal Calculator'}
        headerType={HeaderTypeEnum.Report}
      />

      <SidePanelsLayout
        isScrollBox={true}
        absolutePosition={false}
        leftPanel={
          <Box>
            <Box display="flex">
              <Box flex={1}>
                <List>
                  {categories.map((category) => (
                    <IconButton
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      sx={{
                        color:
                          selectedCategoryID === category.id
                            ? theme.palette.mpdxBlue.main
                            : theme.palette.cruGrayDark.main,
                      }}
                    >
                      {category.icon}
                    </IconButton>
                  ))}
                </List>
              </Box>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ height: '100%' }}
              />
              <Container disableGutters>
                <Box flex={1}>
                  <Typography variant="h6" sx={{ mb: 0, mt: 1, pl: 2 }}>
                    {categoryTitle || 'Goal Calculator'}
                  </Typography>
                  <List disablePadding>
                    {categorySteps?.map((step) => {
                      const { id, title } = step;
                      return (
                        <ListItemButton
                          key={id}
                          sx={{ pl: 3, pr: 0, py: 0 }}
                          onClick={() => handleStepChange(id)}
                        >
                          <ListItemIcon sx={{ minWidth: 'auto', mr: 0.5 }}>
                            {selectedStepID === id ? (
                              <CircleIcon
                                sx={{
                                  fontSize: '1rem',
                                  color: theme.palette.mpdxBlue.main,
                                }}
                              />
                            ) : (
                              <RadioButtonUncheckedIcon
                                sx={{
                                  fontSize: '1rem',
                                  color: theme.palette.cruGrayDark.main,
                                }}
                              />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={title}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Box>
              </Container>
            </Box>
          </Box>
        }
        leftOpen={true}
        leftWidth="290px"
        mainContent={
          <Box
            sx={{
              p: 1,
            }}
          >
            <Container>
              <Toolbar disableGutters sx={{ pl: 2 }}>
                <Typography
                  sx={{ flex: '1 1 100%' }}
                  variant="h6"
                  component="div"
                >
                  {stepTitle || 'Goal Calculator'}
                </Typography>
              </Toolbar>
              <Box>
                {stepComponent || (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body1">
                      Please select a step from the left panel to view its
                      content.
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Continue Button
              {(() => {
                const currentActiveIndex = steps.findIndex(
                  (step) => step.active,
                );
                const currentPageIndex = pages.findIndex(
                  (page) => page.id === currentPageId,
                );
                const isLastPage = currentPageIndex === pages.length - 1;
                const isLastStep = currentActiveIndex === steps.length - 1;
                const shouldShowContinue = !(isLastPage && isLastStep);

                return shouldShowContinue ? (
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: theme.palette.mpdxBlue.main,
                      color: 'white',

                      px: 4,
                      py: 1,
                      '&:hover': {
                        backgroundColor: theme.palette.mpdxBlue.dark,
                      },
                    }}
                    onClick={() => {
                      // Find current active step index
                      const currentActiveIndex = steps.findIndex(
                        (step) => step.active,
                      );

                      if (currentActiveIndex < steps.length - 1) {
                        // Move to next step within current page
                        setSteps((prev) => {
                          const newSteps = prev.map((step, i) => ({
                            ...step,
                            active: i === currentActiveIndex + 1,
                          }));
                          return newSteps;
                        });
                      } else {
                        // Move to next page if at last step
                        const currentPageIndex = pages.findIndex(
                          (page) => page.id === currentPageId,
                        );
                        if (currentPageIndex < pages.length - 1) {
                          const nextPage = pages[currentPageIndex + 1];
                          handlePageChange(nextPage.id);
                        }
                      }
                    }}
                  >
                    Continue
                  </Button>
                ) : null;
              })()} */}
            </Container>
          </Box>
        }
        rightPanel={<h1>hello</h1>}
        rightWidth="60%"
      />
    </Box>
  );
};
