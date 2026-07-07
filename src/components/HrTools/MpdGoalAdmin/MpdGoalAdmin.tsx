import React from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import {
  HeaderTypeEnum,
  NavListButton,
  NavMenuIcon,
  StickyHeader,
  multiPageHeaderHeight,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { getHeaderTitleAccess } from 'src/components/Shared/MultiPageLayout/helpers';
import { CohortBar } from './CohortBar/CohortBar';
import { GoalsTable } from './GoalsTable/GoalsTable';
import { GoalsTableToolbar } from './GoalsTableToolbar/GoalsTableToolbar';
import { useMpdGoalAdmin } from './MpdGoalAdminContext';
import { MpdGoalAdminTabEnum } from './mpdGoalAdminHelpers';

const ContentBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  height: `calc(100vh - ${navBarHeight} - ${multiPageHeaderHeight})`,
  overflow: 'auto',
}));

interface MpdGoalAdminProps {
  navListOpen: boolean;
  onNavListToggle: () => void;
}

export const MpdGoalAdmin: React.FC<MpdGoalAdminProps> = ({
  navListOpen,
  onNavListToggle,
}) => {
  const { t } = useTranslation();
  const { activeTab, setActiveTab, filteredRows } = useMpdGoalAdmin();

  return (
    <>
      <StickyHeader p={2} data-testid="MultiPageHeader">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NavListButton panelOpen={navListOpen} onClick={onNavListToggle}>
            <NavMenuIcon
              titleAccess={getHeaderTitleAccess(HeaderTypeEnum.HrTools, t)}
              data-testid="HrToolsMenuIcon"
            />
          </NavListButton>
          <Typography variant="h5">
            {t('MPD Goal Calculator - Admin Table')}
          </Typography>
        </Box>
      </StickyHeader>

      <Tabs
        value={activeTab}
        onChange={(_event, value) => setActiveTab(value)}
        sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          value={MpdGoalAdminTabEnum.ActiveGoals}
          label={t('Active Goals')}
        />
        <Tab
          value={MpdGoalAdminTabEnum.ScenarioGoals}
          label={t('Scenario Goals')}
        />
      </Tabs>

      <ContentBox>
        {activeTab === MpdGoalAdminTabEnum.ActiveGoals ? (
          <>
            <Typography variant="h6">{t('Active MPD Goals')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('Manage goals for staff who are in a training group')}
            </Typography>
            <CohortBar />
            <GoalsTableToolbar />
            <GoalsTable rows={filteredRows} />
          </>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 4 }}>
            {t('Scenario goals coming soon.')}
          </Typography>
        )}
      </ContentBox>
    </>
  );
};
