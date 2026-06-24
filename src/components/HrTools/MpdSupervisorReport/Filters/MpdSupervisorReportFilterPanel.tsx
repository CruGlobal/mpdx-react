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
import { useMpdSupervisorReport } from '../MpdSupervisorReportContext';
import { mockStaffMembers } from '../mockData';
import {
  ALL_TEAMS,
  ALL_TYPES,
  MpdSupervisorReportEmploymentTypeEnum,
  MpdSupervisorReportQuickFilterEnum,
  MpdSupervisorReportTeamsEnum,
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
    employmentType,
    setEmploymentType,
  } = useMpdSupervisorReport();

  const teamOptions = useMemo(
    () => [...new Set(mockStaffMembers.map((data) => data.user?.team))].sort(),
    [],
  );

  const handleQuickFilter = (filterId: MpdSupervisorReportQuickFilterEnum) => {
    setActiveQuickFilter(filterId);
  };

  const handleSetTeam = (event: React.ChangeEvent<{ value: unknown }>) => {
    setTeam(event.target.value as MpdSupervisorReportTeamsEnum);
  };

  const handleSetEmploymentType = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    setEmploymentType(
      event.target.value as MpdSupervisorReportEmploymentTypeEnum,
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
        >
          <MenuItem value={ALL_TEAMS}>{t('All teams')}</MenuItem>
          {teamOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          value={employmentType}
          onChange={handleSetEmploymentType}
          size="small"
          label={t('Employment type')}
        >
          <MenuItem value={ALL_TYPES}>{t('All types')}</MenuItem>
          <MenuItem value={MpdSupervisorReportEmploymentTypeEnum.FullTime}>
            {t('Full time')}
          </MenuItem>
          <MenuItem value={MpdSupervisorReportEmploymentTypeEnum.PartTime}>
            {t('Part time')}
          </MenuItem>
        </TextField>
      </Stack>
    </Box>
  );
};
