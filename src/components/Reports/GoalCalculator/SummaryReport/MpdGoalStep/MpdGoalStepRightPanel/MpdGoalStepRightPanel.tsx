import React from 'react';
import CalculateIcon from '@mui/icons-material/Calculate';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Box, Button, Divider, Tab, Tabs, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useGoalCalculator } from 'src/components/Reports/GoalCalculator/Shared/GoalCalculatorContext';
import { MpdGoalStepRightPanelAccordion } from './MpdGoalStepRightPanelAccordion';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && children}
    </div>
  );
};

export const MpdGoalStepRightPanel: React.FC = () => {
  const { t } = useTranslation();
  const { closeRightPanel } = useGoalCalculator();
  const [activeTab, setActiveTab] = React.useState(0);
  const theme = useTheme();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label={t('information tabs')}
      >
        <Tab
          sx={{
            pb: 0,
            color: theme.palette.primary.main,
            alignContent: 'center',
          }}
          data-testid="resource-tab"
          iconPosition={'start'}
          icon={<MenuBookIcon />}
          label={t('Resources')}
        />
      </Tabs>

      <Divider />

      <Box sx={{ p: theme.spacing(3) }}>
        <TabPanel value={activeTab} index={0}>
          <Box
            component={Typography}
            display="flex"
            alignItems="center"
            fontWeight={theme.typography.fontWeightBold}
            variant="h6"
            sx={{ mb: theme.spacing(4), gap: theme.spacing(1) }}
          >
            <CalculateIcon
              sx={{ color: theme.palette.secondary.main, mr: 1 }}
            />
            {t('MPD Goal Calculation Table')}
          </Box>
          <MpdGoalStepRightPanelAccordion />
        </TabPanel>

        <Button
          variant="outlined"
          onClick={closeRightPanel}
          sx={{ marginTop: theme.spacing(2) }}
        >
          {t('Close Panel')}
        </Button>
      </Box>
    </Box>
  );
};
