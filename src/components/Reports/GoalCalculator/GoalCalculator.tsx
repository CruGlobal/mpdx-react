import React, { useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import theme from 'src/theme';
import { CalculatorSettings } from './CalculatorSettings/CalculatorSettings';
import { HouseholdExpenses } from './HouseholdExpenses/HouseholdExpenses';
import { MinistryExpenses } from './MinistryExpenses/MinistryExpenses';
import { ContinueButton } from './SharedComponents/ContinueButton';
import { SummaryReport } from './SummaryReport/SummaryReport';

interface PageConfig {
  id: string;
  title: string;
  icon: JSX.Element;
  steps: Array<{
    title: string;
    active: boolean;
    component: JSX.Element;
  }>;
}

interface GoalCalculatorProps {
  isNavListOpen: boolean;
  onNavListToggle: () => void;
}

export const GoalCalculator: React.FC<GoalCalculatorProps> = ({
  isNavListOpen: _isNavListOpen,
  onNavListToggle,
}) => {
  const { t } = useTranslation();
  const [isSubNavListOpen, _setIsSubNavListOpen] = useState<boolean>(false);

// Configuration for all pages
const pages: PageConfig[] = [
  {
    ...CalculatorSettings(),
  },
  {
    ...MinistryExpenses(),
  },
  {
    ...HouseholdExpenses(),
  },
  {
    ...SummaryReport(),
  },
];

export const GoalCalculator: React.FC<GoalCalculatorProps> = ({
  isNavListOpen,
  onNavListToggle,
}) => {
  const [currentPageId, setCurrentPageId] = useState<string>(
    pages[0]?.id || '',
  );
  const currentPage =
    pages.find((page) => page.id === currentPageId) || pages[0];

  const [steps, setSteps] = useState(currentPage?.steps || []);
  const [open] = React.useState(true);

  // Handle page change
  const handlePageChange = (pageId: string) => {
    setCurrentPageId(pageId);
    const page = pages.find((p) => p.id === pageId);
    if (page) {
      setSteps(page.steps);
    }
  };

  // Handle continue button click
  const handleContinue = React.useCallback(() => {
    // Find current active step index
    const currentActiveIndex = steps.findIndex((step) => step.active);

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
  }, [steps, pages, currentPageId, handlePageChange]);

  return (
    <Box>
      <MultiPageHeader
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        title={t('Goal Calculator')}
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
                  {pages.map((page) => (
                    <IconButton
                      key={page.id}
                      onClick={() => handlePageChange(page.id)}
                      sx={{
                        color:
                          currentPageId === page.id
                            ? theme.palette.mpdxBlue.main
                            : theme.palette.cruGrayDark.main,
                      }}
                    >
                      {page.icon}
                    </IconButton>
                  ))}
                </List>
              </Box>
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  height: '100vh',
                }}
              />

              <Container disableGutters>
                <Box flex={1}>
                  <Typography variant="h6" sx={{ mb: 0, mt: 1, pl: 2 }}>
                    {currentPage?.title || t('Goal Calculator')}
                  </Typography>

                  <List disablePadding>
                    {steps.map((option, index) => (
                      <ListItemButton
                        key={index}
                        sx={{ pl: 3, pr: 0, py: 0 }}
                        onClick={() =>
                          setSteps((prev) => {
                            const newSteps = prev.map((step, i) => ({
                              ...step,
                              active: i === index ? true : false,
                            }));
                            return newSteps;
                          })
                        }
                      >
                        <ListItemIcon sx={{ minWidth: 'auto', mr: 0.5 }}>
                          {option.active ? (
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
                          primary={option.title}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Box>
              </Container>
            </Box>
          </Box>
        }
        leftOpen={open}
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
                  {steps.find((step) => step.active)?.title ||
                    t('Goal Calculator')}
                </Typography>
              </Toolbar>
              <Box>
                {steps.find((step) => step.active)?.component ? (
                  React.cloneElement(
                    steps.find((step) => step.active)!.component,
                    { handlePageChange },
                  )
                ) : (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body1">
                      {t(
                        'Please select a step from the left panel to view its content.',
                      )}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Continue Button */}
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

                return (
                  <ContinueButton
                    onClick={handleContinue}
                    show={shouldShowContinue}
                  />
                );
              })()}
            </Container>
          </Box>
        }
        rightPanel={<h1>hello</h1>}
        rightWidth="60%"
      />
    </Box>
  );
};
