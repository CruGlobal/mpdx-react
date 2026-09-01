import React from 'react';
import { mdiAccountGroup } from '@mdi/js';
import Icon from '@mdi/react';
import {
  Alert,
  Box,
  CircularProgress,
  LinearProgress,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import { NullStateBox } from 'src/components/Shared/Filters/NullState/NullStateBox';
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
import { ScenarioGoals } from './ScenarioGoals/ScenarioGoals';
import { MpdGoalAdminTabEnum } from './mpdGoalAdminHelpers';

const ContentBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  height: `calc(100vh - ${navBarHeight} - ${multiPageHeaderHeight})`,
  overflow: 'auto',
}));

/** Everything below the CohortBar on the Active Goals tab. */
const ActiveGoalsContent: React.FC = () => {
  const { t } = useTranslation();
  const { selectedCohortId, filteredRows, loading, error } = useMpdGoalAdmin();

  // Role scoping can leave a user with no cohorts at all, so the auto-select in
  // MpdGoalAdminContext has nothing to pick. Both the toolbar and the table act
  // on a cohort, so neither means anything until one is selected.
  if (!error && !loading && !selectedCohortId) {
    return (
      <NullStateBox role="status" data-testid="no-training-selected">
        <Icon path={mdiAccountGroup} size={1.5} />
        <Typography variant="h5">{t('No Training Selected')}</Typography>
        <Typography>
          {t('There are no trainings available for you to manage.')}
        </Typography>
      </NullStateBox>
    );
  }

  return (
    <>
      <GoalsTableToolbar />
      {/* Surface query failures here rather than as an empty table. */}
      {error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : loading && !filteredRows.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress aria-label={t('Loading MPD goals')} />
        </Box>
      ) : (
        // Search refetches keep previous rows visible instead of a spinner.
        <Box aria-live="polite" aria-busy={loading}>
          {loading && (
            <LinearProgress
              sx={{ mb: 1 }}
              aria-label={t('Refreshing MPD goals')}
            />
          )}
          <GoalsTable rows={filteredRows} />
        </Box>
      )}
    </>
  );
};

interface MpdGoalAdminProps {
  navListOpen: boolean;
  onNavListToggle: () => void;
}

export const MpdGoalAdmin: React.FC<MpdGoalAdminProps> = ({
  navListOpen,
  onNavListToggle,
}) => {
  const { t } = useTranslation();
  const { activeTab, setActiveTab } = useMpdGoalAdmin();

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
            <ActiveGoalsContent />
          </>
        ) : (
          <ScenarioGoals />
        )}
      </ContentBox>
    </>
  );
};
