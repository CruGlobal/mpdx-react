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
import { useTranslation } from 'react-i18next';
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
import { ContinueButton } from './SharedComponents/ContinueButton';

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
    handleContinue,
  } = useContext(GoalCalculatorContext) as GoalCalculatorType;
  const { t } = useTranslation();

  const { title: categoryTitle, steps: categorySteps } = currentCategory || {};
  const { title: stepTitle, component: stepComponent } = currentStep || {};

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
                sx={{
                  height: '100vh',
                }}
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
                      {t(
                        'Please select a step from the left panel to view its content.',
                      )}
                    </Typography>
                  </Box>
                )}
              </Box>
              <ContinueButton onClick={handleContinue} />
            </Container>
          </Box>
        }
        rightPanel={<h1>hello</h1>}
        rightWidth="60%"
      />
    </Box>
  );
};
