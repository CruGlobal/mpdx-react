import React, { useMemo } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MpdAssignmentCategoryGroupEnum } from 'src/graphql/types.generated';
import { useManagedStaffTeamsQuery } from '../ManagedStaffTeams.generated';
import { useMpdSupervisorReport } from '../MpdSupervisorReportContext';
import { getLocalizedAssignmentCategoryGroup } from '../helpers';
import {
  ALL_DEPARTMENTS,
  ALL_TEAMS,
  ALL_TYPES,
  MpdSupervisorReportQuickFilterEnum,
  quickFilterIds,
  quickFilterLabel,
} from './mpdSupervisorReportFilters';

interface MpdSupervisorReportFilterPanelProps {
  onClose: () => void;
}

export const MpdSupervisorReportFilterPanel: React.FC<
  MpdSupervisorReportFilterPanelProps
> = ({ onClose }) => {
  const { t } = useTranslation();
  const {
    activeQuickFilter,
    setActiveQuickFilter,
    team,
    setTeam,
    department,
    setDepartment,
    employmentType,
    setEmploymentType,
  } = useMpdSupervisorReport();

  const { data: teamsData } = useManagedStaffTeamsQuery();

  const allTeams = useMemo(
    () => teamsData?.managedStaffTeams ?? [],
    [teamsData],
  );

  const teamOptions = useMemo(
    () =>
      allTeams
        .filter(
          ({ departments }) =>
            department === ALL_DEPARTMENTS || departments.includes(department),
        )
        .map(({ name }) => name)
        .sort((a, b) => a.localeCompare(b)),
    [allTeams, department],
  );

  const departmentOptions = useMemo(
    () =>
      [
        ...new Set(
          allTeams
            .filter(({ name }) => team === ALL_TEAMS || name === team)
            .flatMap(({ departments }) => departments),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [allTeams, team],
  );

  const handleQuickFilter = (filterId: MpdSupervisorReportQuickFilterEnum) => {
    setActiveQuickFilter(filterId);
  };

  const handleSetTeam = (event: React.ChangeEvent<{ value: unknown }>) => {
    setTeam(event.target.value as string);
  };

  const handleSetDepartment = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    setDepartment(event.target.value as string);
  };

  const handleSetEmploymentType = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    const value = event.target.value as string;
    setEmploymentType(
      value === ALL_TYPES ? null : (value as MpdAssignmentCategoryGroupEnum),
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
        }}
      >
        <Typography id="left-panel-header" variant="h6">
          {t('Filters')}
        </Typography>
        <IconButton aria-label={t('Close')} onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Stack spacing={2} sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {quickFilterIds.map((filterId) => (
            <Chip
              key={filterId}
              label={quickFilterLabel(t, filterId)}
              variant={activeQuickFilter === filterId ? 'filled' : 'outlined'}
              sx={{
                backgroundColor:
                  activeQuickFilter === filterId ? 'primary.main' : 'default',
                color:
                  activeQuickFilter === filterId
                    ? 'primary.contrastText'
                    : 'default',
              }}
              onClick={() => handleQuickFilter(filterId)}
            />
          ))}
        </Stack>

        <TextField
          select
          fullWidth
          value={team}
          onChange={handleSetTeam}
          size="small"
          label={t('Team')}
          // Still loading, or the query failed; either way there is nothing to pick.
          disabled={!teamOptions.length}
        >
          <MenuItem value={ALL_TEAMS}>{t('All teams')}</MenuItem>
          {teamOptions.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          value={department}
          onChange={handleSetDepartment}
          size="small"
          label={t('Department')}
          // Still loading, the query failed, or no team carries a department.
          disabled={!departmentOptions.length}
        >
          <MenuItem value={ALL_DEPARTMENTS}>{t('All departments')}</MenuItem>
          {departmentOptions.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          value={employmentType ?? ALL_TYPES}
          onChange={handleSetEmploymentType}
          size="small"
          label={t('Employment type')}
        >
          <MenuItem value={ALL_TYPES}>{t('All types')}</MenuItem>
          {Object.values(MpdAssignmentCategoryGroupEnum).map((group) => (
            <MenuItem key={group} value={group}>
              {getLocalizedAssignmentCategoryGroup(t, group)}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Box>
  );
};
